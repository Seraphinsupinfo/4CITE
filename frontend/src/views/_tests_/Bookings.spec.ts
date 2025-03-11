// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/UserStore';
import BookingsView from '@/views/BookingsView.vue';

const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn((path) => mockRouterPush(path))
  })
}));

vi.mock('@/services/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn()
  }
}));

import api from '@/services/axiosConfig';

global.localStorage = {
  getItem: vi.fn((key) => {
    if (key === 'token') return 'fake-token';
    if (key === 'user') return JSON.stringify({ id: 1, email: 'user@example.com', pseudo: 'regularuser', role: 'user' });
    return null;
  }),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
};

Object.defineProperty(window, 'location', {
  value: { reload: vi.fn() },
  writable: true
});

describe('BookingsView.vue', () => {
  let wrapper;
  let userStore;

  const mockShowToast = vi.fn();
  const mockReservations = [
    {
      id: 1,
      startDate: '2025-03-15',
      endDate: '2025-03-20',
      userId: 1,
      hotelId: 101,
      hotel: {
        id: 101,
        name: 'Hôtel Magnifique',
        location: 'Paris, France',
        images: ['hotel1.jpg']
      }
    },
    {
      id: 2,
      startDate: '2025-04-10',
      endDate: '2025-04-15',
      userId: 1,
      hotelId: 102,
      hotel: {
        id: 102,
        name: 'Grand Resort',
        location: 'Nice, France',
        images: ['hotel2.jpg']
      }
    }
  ];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  beforeEach(() => {
    vi.clearAllMocks();

    setActivePinia(createPinia());
    userStore = useUserStore();
    userStore.user = { id: 1, role: 'user' };

    mockShowToast.mockReset();

    api.get.mockResolvedValue({ data: mockReservations });
    api.delete.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Initialisation et chargement des données', () => {
    it('devrait charger les réservations au montage', async () => {
      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
      expect(api.get).toHaveBeenCalled();

      const firstCall = api.get.mock.calls[0];
      expect(firstCall[0]).toBe('/users/1/bookings');

      expect(wrapper.vm.reservations.length).toBe(2);
      expect(wrapper.vm.modifiedReservations.length).toBe(2);
    });

    it('devrait gérer les erreurs lors du chargement des réservations', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      api.get.mockRejectedValueOnce(new Error('API Error'));

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();

      expect(consoleSpy).toHaveBeenCalled();
      expect(wrapper.vm.reservations).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('Interface utilisateur et rendu', () => {
    beforeEach(async () => {
      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait afficher "Mes réservations" comme titre pour un utilisateur standard', () => {
      expect(wrapper.find('h2').text()).toBe('Mes réservations');
    });

    it('devrait afficher les détails des réservations', () => {
      const reservationElements = wrapper.findAll('.col-12');

      expect(reservationElements.length).toBe(2);
      expect(reservationElements[0].text()).toContain('Réservation #1');
      expect(reservationElements[0].text()).toContain('Hôtel Magnifique');
      expect(reservationElements[0].text()).toContain('Paris, France');
    });
  });

  describe('Interface administrateur', () => {
    beforeEach(async () => {
      userStore.user = { id: 1, role: 'admin' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait afficher "Gérer les réservations" comme titre', () => {
      expect(wrapper.find('h2').text()).toBe('Gérer les réservations');
    });

    it('devrait afficher les champs de recherche', () => {
      expect(wrapper.find('input[placeholder="Rechercher par email"]').exists()).toBe(true);
      expect(wrapper.find('input[placeholder="Rechercher par numéro de réservation"]').exists()).toBe(true);
      expect(wrapper.find('button.btn-primary').exists()).toBe(true);
    });
  });

  describe('Interaction utilisateur - Utilisateur standard', () => {
    beforeEach(async () => {
      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait naviguer vers la page de l\'hôtel quand on clique sur le bouton', async () => {
      const viewButton = wrapper.findAll('button.btn-outline-primary')[0];
      await viewButton.trigger('click');

      expect(mockRouterPush).toHaveBeenCalled();
    });

    it('devrait marquer une réservation comme modifiée quand les dates sont changées', async () => {
      const dateInput = wrapper.findAll('input[type="date"]')[0];
      await dateInput.setValue('2025-03-16');
      await flushPromises();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.vm.modifiedReservations[0].isModified).toBe(true);

      const saveButton = wrapper.find('button.btn-success');
      expect(saveButton.exists()).toBe(true);
    });
  });

  describe('Tests de fonctionnalité', () => {
    it('devrait déterminer correctement si une réservation peut être annulée', async () => {
      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
      expect(wrapper.vm.canDelete(pastDateStr)).toBe(false);
      expect(wrapper.vm.canDelete(futureDateStr)).toBe(true);
    });
  });
  describe('Recherche et filtrage - Administrateur', () => {
    beforeEach(async () => {
      userStore.user = { id: 1, role: 'admin' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait rechercher des réservations par email', async () => {
      api.get.mockReset();
      api.get.mockResolvedValueOnce({ data: [mockReservations[0]] });

      await wrapper.find('input[placeholder="Rechercher par email"]').setValue('test@example.com');
      const searchButton = wrapper.find('button.btn-primary');
      await searchButton.trigger('click');
      await flushPromises();

      expect(api.get).toHaveBeenCalled();
      const firstCall = api.get.mock.calls[0];
      expect(firstCall[0]).toBe('/bookings');
      expect(firstCall[1].params.user_email).toBe('test@example.com');

      expect(wrapper.vm.reservations.length).toBe(1);
    });

    it('devrait rechercher une réservation par ID', async () => {
      api.get.mockReset();
      api.get.mockResolvedValueOnce({ data: mockReservations[0] });

      await wrapper.find('input[placeholder="Rechercher par numéro de réservation"]').setValue('1');
      const searchButton = wrapper.find('button.btn-primary');
      await searchButton.trigger('click');
      await flushPromises();

      expect(api.get).toHaveBeenCalled();
      const firstCall = api.get.mock.calls[0];
      expect(firstCall[0]).toBe('/bookings/1');

      expect(wrapper.vm.reservations.length).toBe(1);
    });

    it('devrait afficher un message d\'erreur si aucune réservation n\'est trouvée', async () => {
      api.get.mockResolvedValueOnce({ data: null });

      await wrapper.find('input[placeholder="Rechercher par email"]').setValue('nonexistent@example.com');
      const searchButton = wrapper.find('button.btn-primary');
      await searchButton.trigger('click');
      await flushPromises();

      expect(mockShowToast).toHaveBeenCalledWith('Aucune réservation trouvée', 'error');
      expect(wrapper.vm.reservations.length).toBe(0);
    });

  });

  describe('Gestion des réservations - Utilisateur standard', () => {
    beforeEach(async () => {
      userStore.user = { id: 1, role: 'user' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait sauvegarder les modifications de dates', async () => {
      // Modifier la date de début
      const dateInput = wrapper.findAll('input[type="date"]')[0];
      await dateInput.setValue('2025-03-16');
      await flushPromises();

      // Vérifier que le bouton de sauvegarde est apparu
      const saveButton = wrapper.find('button.btn-success');
      expect(saveButton.exists()).toBe(true);

      // Cliquer sur Sauvegarder
      await saveButton.trigger('click');
      await flushPromises();

      // Vérifier l'appel API
      expect(api.put).toHaveBeenCalled();
      const firstCallArgs = api.put.mock.calls[0];
      expect(firstCallArgs[0]).toBe('/bookings/1');
      expect(firstCallArgs[1].startDate).toBe('2025-03-16');

      // Vérifier le message de succès
      expect(mockShowToast).toHaveBeenCalledWith(
        'Les changements ont été sauvegardés avec succès',
        'success'
      );

      // Vérifier que la réservation n'est plus marquée comme modifiée
      expect(wrapper.vm.modifiedReservations[0].isModified).toBe(false);
    });

    it('devrait annuler une réservation future', async () => {
      // Modifier directement pour simuler une réservation future
      wrapper.vm.modifiedReservations[0].endDate = futureDateStr;
      await flushPromises();

      // Vérifier que le bouton d'annulation est actif
      const deleteButton = wrapper.findAll('button.btn-danger')[0];
      expect(deleteButton.element.disabled).toBe(false);

      // Cliquer sur Annuler
      await deleteButton.trigger('click');
      await flushPromises();

      // Vérifier l'appel API
      expect(api.delete).toHaveBeenCalled();
      const firstCallArgs = api.delete.mock.calls[0];
      expect(firstCallArgs[0]).toBe('/bookings/1');

      // Vérifier le message de succès
      expect(mockShowToast).toHaveBeenCalledWith('Réservation supprimée', 'success');
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('devrait désactiver le bouton d\'annulation pour les réservations passées', async () => {
      // Modifier directement pour simuler une réservation passée
      wrapper.vm.modifiedReservations[0].endDate = pastDateStr;
      await flushPromises();

      // Vérifier que le bouton d'annulation est désactivé
      const deleteButton = wrapper.findAll('button.btn-danger')[0];
      expect(deleteButton.element.disabled).toBe(true);
    });
  });

  describe('Comportements divers et cas particuliers', () => {
    it('devrait afficher "Rien à afficher ici" quand il n\'y a pas de réservations', async () => {
      userStore.user = { id: 1, role: 'user' };
      api.get.mockResolvedValueOnce({ data: [] });

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();

      const emptyMessage = wrapper.find('.d-flex.align-items-center span');
      expect(emptyMessage.exists()).toBe(true);
      expect(emptyMessage.text()).toBe('Rien à afficher ici');
    });

    it('devrait correctement détecter qu\'une réservation est modifiée quand la date de fin change', async () => {
      userStore.user = { id: 1, role: 'user' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();

      // Vérifier l'état initial
      expect(wrapper.vm.modifiedReservations[0].isModified).toBe(false);

      // Appeler directement la fonction handleDateChange
      wrapper.vm.modifiedReservations[0].endDate = '2025-03-22';
      wrapper.vm.handleDateChange(wrapper.vm.modifiedReservations[0]);

      // Vérifier que la réservation est marquée comme modifiée
      expect(wrapper.vm.modifiedReservations[0].isModified).toBe(true);
    });

    it('ne devrait pas détecter de modification si les dates restent identiques', async () => {
      userStore.user = { id: 1, role: 'user' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();

      // Appeler directement la fonction handleDateChange avec les mêmes dates
      wrapper.vm.handleDateChange(wrapper.vm.modifiedReservations[0]);

      // Vérifier que la réservation n'est pas marquée comme modifiée
      expect(wrapper.vm.modifiedReservations[0].isModified).toBe(false);
    });
  });

  describe('Affichage des informations de réservation', () => {
    beforeEach(async () => {
      userStore.user = { id: 1, role: 'user' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait afficher le numéro de réservation correctement', () => {
      const reservationElements = wrapper.findAll('.col-12');

      expect(reservationElements[0].text()).toContain('Réservation #1');
      expect(reservationElements[1].text()).toContain('Réservation #2');
    });

    it('devrait afficher le nom et l\'emplacement de l\'hôtel', () => {
      const reservationElements = wrapper.findAll('.col-12');

      // Première réservation
      expect(reservationElements[0].text()).toContain('Hôtel Magnifique');
      expect(reservationElements[0].text()).toContain('Paris, France');

      // Deuxième réservation
      expect(reservationElements[1].text()).toContain('Grand Resort');
      expect(reservationElements[1].text()).toContain('Nice, France');
    });

    it('devrait afficher l\'image de l\'hôtel', () => {
      const images = wrapper.findAll('.ref-product-photo');

      expect(images.length).toBe(2);
      expect(images[0].attributes('src')).toBe('hotel1.jpg');
      expect(images[1].attributes('src')).toBe('hotel2.jpg');
    });

    it('devrait afficher les dates de la réservation dans les champs de date', async () => {
      api.get.mockReset();

      const freshMockReservations = JSON.parse(JSON.stringify([
        {
          id: 1,
          startDate: '2025-03-15',
          endDate: '2025-03-20',
          rentalId: 1,
          userId: 1
        },
        {
          id: 2,
          startDate: '2025-04-10',
          endDate: '2025-04-15',
          rentalId: 2,
          userId: 1
        }
      ]));

      api.get.mockResolvedValueOnce({ data: freshMockReservations });
      const localWrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
      const dateInputs = localWrapper.findAll('input[type="date"]');

      expect(dateInputs[0].element.value).toBe('2025-03-15');
      expect(dateInputs[1].element.value).toBe('2025-03-20');
      expect(dateInputs[2].element.value).toBe('2025-04-10');
      expect(dateInputs[3].element.value).toBe('2025-04-15');
    });


  });

  describe('Méthode canDelete', () => {
    beforeEach(async () => {
      userStore.user = { id: 1, role: 'user' };

      wrapper = mount(BookingsView, {
        global: {
          stubs: {
            'toast-message': {
              template: '<div data-test="toast"></div>',
              methods: { showToast: mockShowToast }
            }
          }
        }
      });

      await flushPromises();
    });

    it('devrait retourner true pour une date future', () => {
      // Créer une date future
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      expect(wrapper.vm.canDelete(tomorrowStr)).toBe(true);
    });

    it('devrait retourner false pour une date passée', () => {
      // Créer une date passée
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      expect(wrapper.vm.canDelete(yesterdayStr)).toBe(false);
    });

    it('devrait retourner false pour la date du jour', () => {
      // Date du jour
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      expect(wrapper.vm.canDelete(todayStr)).toBe(false);
    });

    it('devrait retourner false si la date est undefined', () => {
      expect(wrapper.vm.canDelete(undefined)).toBe(false);
    });

    it('devrait retourner false si la date est null', () => {
      expect(wrapper.vm.canDelete(null)).toBe(false);
    });

    it('devrait retourner false si la date est une chaîne vide', () => {
      expect(wrapper.vm.canDelete('')).toBe(false);
    });

    it('devrait gérer correctement les formats de date non standards', () => {
      // Format MM/DD/YYYY
      const futureDateMMDDYYYY = '12/31/2099';
      // Cela pourrait échouer selon l'implémentation de canDelete,
      // mais c'est bon de tester ce cas limite
      expect(wrapper.vm.canDelete(futureDateMMDDYYYY)).toBe(true);
    });
  });

});
