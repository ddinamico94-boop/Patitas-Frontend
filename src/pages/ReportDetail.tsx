import { useEffect, useState } from 'react';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  statusLabel,
  statusColor,
} from '../data/mock';

import type { NavigateFn } from '../types/navigation';

import {
  getReport,
  listReports,
  getSession,
  markReportAsAdopted,
} from '../lib/api';

import Footer from '../components/Footer';
import SEO from '../components/SEO';

function buildWhatsAppLink(
  phone: string,
  message: string
): string {
  const digits = phone
    .replace(/\D/g, '')
    .replace(/^0/, '');

  return `https://wa.me/54${digits}?text=${encodeURIComponent(
    message
  )}`;
}

export default function ReportDetail({
  id,
  navigate,
}: {
  id: string | null;
  navigate: NavigateFn;
}) {
  const queryClient = useQueryClient();

  const [imgIdx, setImgIdx] = useState(0);
  const [showContact, setShowContact] =
    useState(false);

  const [
    markingAdopted,
    setMarkingAdopted,
  ] = useState(false);

  const [
    adoptionError,
    setAdoptionError,
  ] = useState<string | null>(null);

  const {
    data: animal,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ['report', id],

    queryFn: () => {
      if (!id) {
        throw new Error(
          'Reporte no encontrado.'
        );
      }

      return getReport(id);
    },

    enabled: !!id,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  const isAdoption =
    animal?.status === 'en_adopcion' ||
    animal?.status === 'adoptado';

  const isAdopted =
    animal?.status === 'adoptado';

  /*
   * Comprobamos quién es el usuario
   * actualmente autenticado.
   *
   * Esto solamente controla la interfaz.
   * La seguridad real sigue estando
   * en el backend.
   */
  const session = getSession();

  const isOwner =
    !!animal?.reporterUserId &&
    !!session?.user?.id &&
    animal.reporterUserId ===
      session.user.id;

  const {
    data: relatedData,
  } = useQuery({
    queryKey: [
      'reports',
      'related',
      isAdoption
        ? 'adoption'
        : 'reports',
      animal?.zone,
    ],

    queryFn: () => {
      /*
       * Para adopciones buscamos otros
       * animales actualmente en adopción.
       */
      if (isAdoption) {
        return listReports({
          status: 'en_adopcion',
          pageSize: 6,
        });
      }

      /*
       * Para reportes normales mantenemos
       * el comportamiento original.
       */
      return listReports({
        zone: animal!.zone,
        pageSize: 6,
      });
    },

    enabled: !!animal,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  const related =
    relatedData?.items
      ?.filter((r) => {
        if (r.id === animal?.id) {
          return false;
        }

        if (isAdoption) {
          return (
            r.status ===
            'en_adopcion'
          );
        }

        return (
          r.status !==
            'en_adopcion' &&
          r.status !== 'adoptado'
        );
      })
      .slice(0, 3) ?? [];

  useEffect(() => {
    setImgIdx(0);
    setShowContact(false);
    setAdoptionError(null);
  }, [id]);

  const prefetchRelatedReport = (
    reportId: string
  ) => {
    queryClient.prefetchQuery({
      queryKey: [
        'report',
        reportId,
      ],

      queryFn: () =>
        getReport(reportId),

      staleTime:
        5 * 60 * 1000,
    });
  };

  /*
   * =====================================================
   * MARCAR COMO ADOPTADO
   * =====================================================
   */

  const handleMarkAsAdopted =
    async () => {
      if (
        !animal ||
        animal.status !==
          'en_adopcion' ||
        !isOwner
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `¿Confirmás que ${animal.name} ya fue adoptado?\n\nEsta publicación dejará de aparecer entre los animales disponibles para adopción.`
        );

      if (!confirmed) {
        return;
      }

      setMarkingAdopted(true);
      setAdoptionError(null);

      try {
        const updated =
          await markReportAsAdopted(
            animal.id
          );

        /*
         * Actualizamos inmediatamente
         * el detalle.
         */
        queryClient.setQueryData(
          [
            'report',
            animal.id,
          ],
          updated
        );

        /*
         * Invalidamos los listados para
         * que desaparezca de /adoptar.
         */
        await queryClient.invalidateQueries(
          {
            queryKey: [
              'reports',
            ],
          }
        );

        setShowContact(false);
      } catch (err) {
        setAdoptionError(
          err instanceof Error
            ? err.message
            : 'No se pudo marcar la publicación como adoptada.'
        );
      } finally {
        setMarkingAdopted(
          false
        );
      }
    };

  /*
   * =====================================================
   * COMPARTIR
   * =====================================================
   */

  const handleShare =
    async () => {
      if (!animal) {
        return;
      }

      const shareUrl =
        `https://www.patitastucuman.com/compartir/reporte/${animal.id}`;

      const shareData = {
        title:
          `${animal.name} · ${
            statusLabel[
              animal.status
            ]
          }`,

        text: isAdoption
          ? isAdopted
            ? `${animal.name} encontró una familia gracias a Patitas Tucumán.`
            : `${animal.name} está en adopción en Patitas Tucumán. Ayudemos a encontrarle una familia.`
          : `${animal.name} · ${
              statusLabel[
                animal.status
              ]
            } en ${
              animal.zone
            }. Ayudemos a difundir este reporte.`,

        url: shareUrl,
      };

      if (
        navigator.share
      ) {
        try {
          await navigator.share(
            shareData
          );
        } catch {
          /*
           * El usuario cerró
           * el menú.
           */
        }

        return;
      }

      try {
        await navigator.clipboard.writeText(
          shareData.url
        );

        alert(
          'Link copiado. Pegalo donde quieras compartirlo.'
        );
      } catch {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareData.text} ${shareData.url}`
          )}`,
          '_blank'
        );
      }
    };

  /*
   * =====================================================
   * ESTADOS DE CARGA
   * =====================================================
   */

  if (!id) {
    return (
      <div className="bg-cream min-h-full flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">
          Reporte no encontrado.
        </p>

        <button
          onClick={() =>
            navigate(
              'reports'
            )
          }
          className="text-terra font-medium hover:underline"
        >
          Volver a reportes
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-full flex items-center justify-center py-24 text-warm-mid">
        Cargando reporte...
      </div>
    );
  }

  if (
    isError ||
    !animal
  ) {
    return (
      <div className="bg-cream min-h-full flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">
          {error instanceof Error
            ? error.message
            : 'Reporte no encontrado.'}
        </p>

        <button
          onClick={() =>
            navigate(
              'reports'
            )
          }
          className="text-terra font-medium hover:underline"
        >
          Volver a reportes
        </button>
      </div>
    );
  }

  /*
   * =====================================================
   * DATOS VISUALES
   * =====================================================
   */

  const emoji =
    animal.type === 'perro'
      ? '🐕'
      : animal.type ===
          'gato'
        ? '🐈'
        : '🐾';

  const speciesLabel =
    animal.type === 'perro'
      ? 'Perro'
      : animal.type ===
          'gato'
        ? 'Gato'
        : 'Otro';

  const sexLabel =
    animal.sex === 'macho'
      ? 'Macho'
      : animal.sex ===
          'hembra'
        ? 'Hembra'
        : '—';

  const currentImage =
    animal.images?.[
      imgIdx
    ] ||
    animal.imageUrl;

  const seoTitle =
    isAdoption
      ? isAdopted
        ? `${animal.name} fue adoptado | Patitas Tucumán`
        : `${animal.name} busca una familia | Patitas Tucumán`
      : `${animal.name} - ${
          statusLabel[
            animal.status
          ]
        } en ${
          animal.zone
        } | Patitas Tucumán`;

  const seoDescription =
    isAdoption
      ? isAdopted
        ? `${animal.name} encontró una familia en Tucumán.`
        : `${animal.name} está en adopción en ${animal.zone}, Tucumán. Conocé su historia y consultá por su adopción.`
      : `${animal.name} fue reportado como ${statusLabel[
          animal.status
        ].toLowerCase()} en ${animal.zone}, Tucumán. Consultá el reporte y ayudá a difundirlo.`;

  const whatsappMessage =
    isAdoption
      ? `Hola! Vi a ${animal.name} en adopción en Patitas Tucumán y me gustaría conocer más sobre ${
          animal.sex ===
          'hembra'
            ? 'ella'
            : 'él'
        }.`
      : `Hola! Vi el reporte de ${animal.name} en Patitas Tucumán y quiero contarte algo.`;

  const characteristics =
    isAdoption
      ? [
          {
            label:
              'Especie',
            value:
              `${emoji} ${speciesLabel}`,
          },

          {
            label:
              'Sexo',
            value:
              sexLabel,
          },

          {
            label:
              'Edad',
            value:
              animal.age ||
              '—',
          },

          {
            label:
              'Tamaño',
            value:
              animal.size ||
              '—',
          },

          {
            label:
              'Raza',
            value:
              animal.breed ||
              '—',
          },

          {
            label:
              'Color',
            value:
              animal.color ||
              '—',
          },

          {
            label:
              'Zona',
            value:
              animal.zone,
          },
        ]
      : [
          {
            label:
              'Especie',
            value:
              `${emoji} ${speciesLabel}`,
          },

          {
            label:
              'Raza',
            value:
              animal.breed ||
              '—',
          },

          {
            label:
              'Color',
            value:
              animal.color ||
              '—',
          },

          {
            label:
              'Tamaño',
            value:
              animal.size ||
              '—',
          },

          {
            label:
              'Zona',
            value:
              animal.zone,
          },

          {
            label:
              'Fecha',
            value:
              animal.date,
          },
        ];

  return (
    <div className="bg-cream min-h-full">
      <SEO
        title={
          seoTitle
        }
        description={
          seoDescription
        }
        path={`/reporte/${animal.id}`}
        image={
          animal.imageUrl ||
          'https://www.patitastucuman.com/og-image.png'
        }
        structuredData={{
          '@context':
            'https://schema.org',

          '@type':
            'Article',

          headline:
            isAdoption
              ? isAdopted
                ? `${animal.name} fue adoptado`
                : `${animal.name} busca una familia`
              : `${animal.name} - ${
                  statusLabel[
                    animal
                      .status
                  ]
                } en ${
                  animal.zone
                }`,

          description:
            animal.description ||
            seoDescription,

          image:
            animal.imageUrl
              ? [
                  animal.imageUrl,
                ]
              : [
                  'https://www.patitastucuman.com/og-image.png',
                ],

          mainEntityOfPage:
            {
              '@type':
                'WebPage',

              '@id':
                `https://www.patitastucuman.com/reporte/${animal.id}`,
            },

          url:
            `https://www.patitastucuman.com/reporte/${animal.id}`,

          author: {
            '@type':
              'Organization',

            name:
              'Patitas Tucumán',

            url:
              'https://www.patitastucuman.com',
          },

          publisher: {
            '@type':
              'Organization',

            name:
              'Patitas Tucumán',

            url:
              'https://www.patitastucuman.com',

            logo: {
              '@type':
                'ImageObject',

              url:
                'https://www.patitastucuman.com/og-image.png',
            },
          },

          about: {
            '@type':
              'Thing',

            name:
              `${animal.type} ${
                statusLabel[
                  animal
                    .status
                ]
              }`,
          },

          contentLocation:
            {
              '@type':
                'Place',

              name:
                `${animal.zone}, Tucumán, Argentina`,
            },
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* VOLVER */}

        <button
          type="button"
          onClick={() =>
            navigate(
              isAdoption
                ? 'adoptar'
                : 'reports'
            )
          }
          className="inline-flex items-center gap-1.5 text-sm text-warm-mid hover:text-terra transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>

          {isAdoption
            ? 'Volver a adoptar'
            : 'Volver a reportes'}
        </button>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* ================================================= */}
          {/* IZQUIERDA */}
          {/* ================================================= */}

          <div className="lg:col-span-3 space-y-6">
            {/* IMAGEN */}

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-warm">
              {currentImage ? (
                <img
                  src={
                    currentImage
                  }
                  alt={
                    animal.name
                  }
                  className="w-full h-full object-cover"
                  decoding="async"
                  width="800"
                  height="600"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  {emoji}
                </div>
              )}
            </div>

            {/* MINIATURAS */}

            {animal.images
              ?.length >
              1 && (
              <div className="flex gap-2 overflow-x-auto">
                {animal.images.map(
                  (
                    img,
                    i
                  ) => (
                    <button
                      type="button"
                      key={
                        img
                      }
                      onClick={() =>
                        setImgIdx(
                          i
                        )
                      }
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0 ${
                        i ===
                        imgIdx
                          ? 'border-terra'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={
                          img
                        }
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="80"
                        height="64"
                      />
                    </button>
                  )
                )}
              </div>
            )}

            {/* DESCRIPCIÓN */}

            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-xl font-semibold text-dark mb-3">
                {isAdoption
                  ? `Sobre ${animal.name}`
                  : 'Descripción'}
              </h3>

              <p className="text-dark/70 leading-relaxed">
                {animal.description ||
                  'Sin descripción adicional.'}
              </p>
            </div>

            {/* CARACTERÍSTICAS */}

            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-xl font-semibold text-dark mb-4">
                Características
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {characteristics.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.label
                      }
                      className="bg-warm rounded-xl p-4"
                    >
                      <p className="text-xs text-warm-mid font-medium mb-1">
                        {
                          item.label
                        }
                      </p>

                      <p className="text-sm font-medium text-dark">
                        {
                          item.value
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* CTA */}

            {isAdoption ? (
              isAdopted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h3 className="font-display text-xl font-semibold text-dark mb-2">
                    🎉{' '}
                    {animal.name}{' '}
                    encontró una
                    familia
                  </h3>

                  <p className="text-dark/70 text-sm">
                    Esta
                    publicación
                    ya fue marcada
                    como adoptada.
                    Gracias a
                    quienes
                    ayudaron a
                    compartirla.
                  </p>
                </div>
              ) : (
                <div className="bg-terra/8 border border-terra/20 rounded-2xl p-6">
                  <h3 className="font-display text-xl font-semibold text-dark mb-2">
                    ¿Te gustaría
                    adoptar a{' '}
                    {animal.name}?
                  </h3>

                  <p className="text-dark/70 text-sm mb-4">
                    Contactate
                    con la
                    persona que
                    publicó a{' '}
                    {animal.name}{' '}
                    para conocer
                    más sobre su
                    historia y
                    consultar por
                    el proceso de
                    adopción.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowContact(
                        true
                      );

                      if (
                        animal.phone
                      ) {
                        window.open(
                          buildWhatsAppLink(
                            animal.phone,
                            whatsappMessage
                          ),
                          '_blank'
                        );
                      }
                    }}
                    className="px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                  >
                    Consultar por
                    adopción
                  </button>
                </div>
              )
            ) : (
              <div className="bg-terra/8 border border-terra/20 rounded-2xl p-6">
                <h3 className="font-display text-xl font-semibold text-dark mb-2">
                  ¿Viste a este
                  animal?
                </h3>

                <p className="text-dark/70 text-sm mb-4">
                  Si tenés
                  información
                  sobre la
                  ubicación o el
                  paradero de{' '}
                  {animal.name},
                  contactá
                  directamente a
                  quien hizo el
                  reporte. Tu
                  información
                  puede hacer una
                  gran
                  diferencia.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowContact(
                      true
                    );

                    if (
                      animal.phone
                    ) {
                      window.open(
                        buildWhatsAppLink(
                          animal.phone,
                          whatsappMessage
                        ),
                        '_blank'
                      );
                    }
                  }}
                  className="px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Tengo
                  información
                </button>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* DERECHA */}
          {/* ================================================= */}

          <div className="lg:col-span-2 space-y-5">
            {/* TARJETA PRINCIPAL */}

            <div className="bg-white rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-dark mb-1">
                    {
                      animal.name
                    }
                  </h1>

                  <p className="text-warm-mid text-sm">
                    {animal.breed ||
                      speciesLabel}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
                    statusColor[
                      animal
                        .status
                    ]
                  }`}
                >
                  {
                    statusLabel[
                      animal
                        .status
                    ]
                  }
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-warm-mid mb-6">
                {isAdoption ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>

                    <span>
                      {isAdopted
                        ? 'Adopción concretada'
                        : 'Buscando una familia'}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />

                      <circle
                        cx="12"
                        cy="10"
                        r="3"
                      />
                    </svg>

                    <span>
                      {
                        animal.zone
                      }{' '}
                      · Reportado
                      el{' '}
                      {
                        animal.date
                      }
                    </span>
                  </>
                )}
              </div>

              {/* DATOS RÁPIDOS ADOPCIÓN */}

              {isAdoption &&
                !isAdopted && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-warm rounded-xl p-3 text-center">
                      <p className="text-[11px] text-warm-mid mb-1">
                        Sexo
                      </p>

                      <p className="text-sm font-semibold text-dark">
                        {
                          sexLabel
                        }
                      </p>
                    </div>

                    <div className="bg-warm rounded-xl p-3 text-center">
                      <p className="text-[11px] text-warm-mid mb-1">
                        Edad
                      </p>

                      <p className="text-sm font-semibold text-dark">
                        {animal.age ||
                          '—'}
                      </p>
                    </div>

                    <div className="bg-warm rounded-xl p-3 text-center">
                      <p className="text-[11px] text-warm-mid mb-1">
                        Tamaño
                      </p>

                      <p className="text-sm font-semibold text-dark">
                        {animal.size ||
                          '—'}
                      </p>
                    </div>
                  </div>
                )}

              <div className="space-y-2.5">
                {/* SOLO EL DUEÑO PUEDE VER ESTE BOTÓN */}

                {isAdoption &&
                  !isAdopted &&
                  isOwner && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAsAdopted
                      }
                      disabled={
                        markingAdopted
                      }
                      className="w-full py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {markingAdopted
                        ? 'Marcando como adoptado...'
                        : '✓ Marcar como adoptado'}
                    </button>
                  )}

                {adoptionError &&
                  isOwner && (
                    <p className="text-sm text-red-600 text-center">
                      {
                        adoptionError
                      }
                    </p>
                  )}

                {!isAdopted && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowContact(
                        !showContact
                      )
                    }
                    className="w-full py-3 border-2 border-border text-dark font-semibold rounded-xl hover:border-terra hover:text-terra transition-colors"
                  >
                    {isAdoption
                      ? 'Consultar por adopción'
                      : 'Contactar'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    handleShare
                  }
                  className="w-full py-3 border border-border text-warm-mid rounded-xl text-sm hover:border-terra hover:text-terra transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle
                      cx="18"
                      cy="5"
                      r="3"
                    />

                    <circle
                      cx="6"
                      cy="12"
                      r="3"
                    />

                    <circle
                      cx="18"
                      cy="19"
                      r="3"
                    />

                    <line
                      x1="8.59"
                      y1="13.51"
                      x2="15.42"
                      y2="17.49"
                    />

                    <line
                      x1="15.41"
                      y1="6.51"
                      x2="8.59"
                      y2="10.49"
                    />
                  </svg>

                  {isAdoption
                    ? 'Compartir publicación'
                    : 'Compartir reporte'}
                </button>
              </div>
            </div>

            {/* CONTACTO */}

            {showContact &&
              !isAdopted && (
                <div className="bg-white rounded-2xl p-6 border border-terra/30">
                  <h3 className="font-display text-lg font-semibold text-dark mb-4">
                    {isAdoption
                      ? 'Contacto para la adopción'
                      : 'Información de contacto'}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                        👤
                      </div>

                      <div>
                        <p className="text-xs text-warm-mid">
                          Nombre
                        </p>

                        <p className="text-sm font-medium text-dark">
                          {animal.contact ||
                            '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                        📞
                      </div>

                      <div>
                        <p className="text-xs text-warm-mid">
                          Teléfono
                        </p>

                        <p className="text-sm font-medium text-dark">
                          {animal.phone ||
                            '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                        ✉️
                      </div>

                      <div>
                        <p className="text-xs text-warm-mid">
                          Email
                        </p>

                        <p className="text-sm font-medium text-dark break-all">
                          {animal.email ||
                            '—'}
                        </p>
                      </div>
                    </div>

                    {isAdoption &&
                      animal.phone && (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              buildWhatsAppLink(
                                animal.phone,
                                whatsappMessage
                              ),
                              '_blank'
                            )
                          }
                          className="w-full mt-3 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                        >
                          Consultar por
                          WhatsApp
                        </button>
                      )}
                  </div>
                </div>
              )}

            {/* MAPA — NUNCA PARA ADOPCIÓN */}

            {!isAdoption && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <h3 className="font-display text-lg font-semibold text-dark mb-3">
                  Ubicación
                  aproximada
                </h3>

                {animal.lat !==
                  0 ||
                animal.lng !==
                  0 ? (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <iframe
                      title="Ubicación del reporte"
                      width="100%"
                      height="160"
                      loading="lazy"
                      style={{
                        border: 0,
                      }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        animal.lng -
                        0.01
                      }%2C${
                        animal.lat -
                        0.01
                      }%2C${
                        animal.lng +
                        0.01
                      }%2C${
                        animal.lat +
                        0.01
                      }&layer=mapnik&marker=${
                        animal.lat
                      }%2C${
                        animal.lng
                      }`}
                    />

                    <p className="text-xs text-warm-mid px-3 py-2 bg-warm">
                      {
                        animal.zone
                      }
                    </p>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-center p-4">
                    <p className="text-sm text-warm-mid">
                      Este reporte
                      no tiene una
                      ubicación
                      exacta
                      guardada.
                      Zona:{' '}
                      {
                        animal.zone
                      }
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      'map'
                    )
                  }
                  className="mt-3 w-full py-2 text-xs text-terra font-medium hover:underline"
                >
                  Ver en mapa
                  completo →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* RELACIONADOS */}
        {/* ================================================= */}

        {related.length >
          0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">
              {isAdoption
                ? 'Otros animales en adopción'
                : 'Reportes relacionados'}
            </h2>

            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(
                (r) => (
                  <button
                    type="button"
                    key={
                      r.id
                    }
                    onMouseEnter={() =>
                      prefetchRelatedReport(
                        r.id
                      )
                    }
                    onFocus={() =>
                      prefetchRelatedReport(
                        r.id
                      )
                    }
                    onTouchStart={() =>
                      prefetchRelatedReport(
                        r.id
                      )
                    }
                    onClick={() => {
                      navigate(
                        'detail',
                        r.id
                      );

                      window.scrollTo(
                        0,
                        0
                      );
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-warm">
                      {r.imageUrl ? (
                        <img
                          src={
                            r.imageUrl
                          }
                          alt={
                            r.name
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          width="400"
                          height="225"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🐾
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-display font-semibold text-dark">
                          {
                            r.name
                          }
                        </span>

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            statusColor[
                              r
                                .status
                            ]
                          }`}
                        >
                          {
                            statusLabel[
                              r
                                .status
                            ]
                          }
                        </span>
                      </div>

                      <p className="text-xs text-warm-mid">
                        {isAdoption
                          ? r.zone
                          : `${r.zone} · ${r.date}`}
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <Footer
        navigate={
          navigate
        }
      />
    </div>
  );
}