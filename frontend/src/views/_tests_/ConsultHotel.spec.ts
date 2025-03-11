// @ts-nocheck
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from "@/services/axiosConfig.ts";
import { useUserStore } from "@/stores/UserStore.ts";
import ConsultHotel from "@/views/ConsultHotel.vue";

vi.mock("@/services/axiosConfig.ts", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn()
  }
}));

vi.mock("@/stores/UserStore.ts", () => ({
  useUserStore: vi.fn()
}));

describe('ConsultHotel', () => {
  let wrapper;
  const mockUserStore = {
    user: { id: 1, role: 'user' },
    isLoggedIn: true
  };

  const mockHotel = {
    id: 123,
    name: "Hôtel de Test",
    location: "Paris",
    description: "Un superbe hôtel pour nos tests",
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    creationDate: "2023-01-01"
  };

  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useUserStore.mockReturnValue(mockUserStore);
    api.get.mockResolvedValue({ data: mockHotel });

    global.localStorage = {
      getItem: vi.fn().mockReturnValue('fake-token'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });

    global.confirm = vi.fn();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  it('devrait charger les informations de l\'hôtel au montage', async () => {
    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/hotels/123');
    expect(wrapper.vm.hotel.name).toBe(mockHotel.name);
    expect(wrapper.vm.hotel.location).toBe(mockHotel.location);
    expect(wrapper.vm.hotel.description).toBe(mockHotel.description);
  });

  it('devrait afficher le nom de l\'hôtel comme texte pour les utilisateurs', async () => {
    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    expect(wrapper.find('h3.fw-bold input').exists()).toBe(false);
    expect(wrapper.find('h3.fw-bold span').text()).toBe(mockHotel.name);
  });

  it('devrait afficher un champ de saisie pour le nom de l\'hôtel pour l\'administrateur', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    expect(wrapper.find('h3.fw-bold input').exists()).toBe(true);
    expect(wrapper.find('h3.fw-bold input').element.value).toBe(mockHotel.name);
  });

  it('devrait afficher le formulaire de réservation pour les utilisateurs connectés', async () => {
    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    expect(wrapper.find('button.btn-primary').exists()).toBe(true);
    expect(wrapper.find('button.btn-primary').text()).toContain('Réserver');
    expect(wrapper.text()).not.toContain('Vous devez être connecté pour réserver');
  });

  it('devrait afficher un message invitant à se connecter pour les utilisateurs non connectés', async () => {
    useUserStore.mockReturnValue({
      user: { },
      isLoggedIn: false
    });

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    expect(wrapper.find('button.btn-primary').text()).not.toContain('Réserver');
    expect(wrapper.text()).toContain('Vous devez être connecté pour réserver');
    expect(wrapper.find('a[href="/login"]').exists()).toBe(true);
  });

  it('devrait effectuer une réservation lorsque le bouton Réserver est cliqué', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    const startDateInput = wrapper.find('#startDate');
    await startDateInput.setValue('2023-12-01');

    const endDateInput = wrapper.find('#endDate');
    await endDateInput.setValue('2023-12-05');

    expect(startDateInput.element.value).toBe('2023-12-01');
    expect(endDateInput.element.value).toBe('2023-12-05');

    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith('/bookings', {
      startDate: '2023-12-01',
      endDate: '2023-12-05',
      userId: 1,
      hotelId: 123
    }, {
      headers: {
        Authorization: 'Bearer fake-token'
      }
    });

    expect(mockShowToast).toHaveBeenCalledWith('Réservation effectuée avec succès!', 'success');
  });


  it('devrait afficher une erreur si la réservation échoue', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "Dates non disponibles" } }
    });

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('Erreur lors de la réservation'), 'error');
  });

  it('devrait permettre à l\'administrateur de modifier les informations de l\'hôtel', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    api.put.mockResolvedValue({});

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('h3.fw-bold input').setValue('Hôtel de Test Modifié');
    await wrapper.find('textarea').setValue('Description mise à jour');

    await wrapper.find('button.btn-success').trigger('click');
    await flushPromises();

    expect(api.put).toHaveBeenCalledWith('/hotels/123', {
      name: 'Hôtel de Test Modifié',
      location: mockHotel.location,
      description: 'Description mise à jour',
      images: mockHotel.images
    }, {
      headers: {
        Authorization: 'Bearer fake-token'
      }
    });

    expect(mockShowToast).toHaveBeenCalledWith('Hôtel mis à jour avec succès!', 'success');
  });

  it('devrait afficher un toast d\'erreur si la mise à jour échoue', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    api.put.mockRejectedValue(new Error('Erreur de mise à jour'));

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('button.btn-success').trigger('click');
    await flushPromises();

    expect(mockShowToast).toHaveBeenCalledWith('Erreur lors de la mise à jour.', 'error');
  });

  it('devrait permettre à l\'administrateur de supprimer l\'hôtel après confirmation', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    global.confirm.mockReturnValue(true);

    api.delete.mockResolvedValue({});

    vi.useFakeTimers();

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('button.btn-danger').trigger('click');
    await flushPromises();

    expect(global.confirm).toHaveBeenCalledWith("Êtes-vous sûr de vouloir supprimer cet hôtel ?");

    expect(api.delete).toHaveBeenCalledWith('/hotels/123', {
      headers: {
        Authorization: 'Bearer fake-token'
      }
    });

    expect(mockShowToast).toHaveBeenCalledWith('Hôtel supprimé avec succès!', 'success');

    vi.runAllTimers();

    expect(window.location.href).toBe('/');
  });

  it('ne devrait pas supprimer l\'hôtel si l\'utilisateur annule la confirmation', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    global.confirm.mockReturnValue(false);

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('button.btn-danger').trigger('click');
    await flushPromises();

    expect(global.confirm).toHaveBeenCalledWith("Êtes-vous sûr de vouloir supprimer cet hôtel ?");

    expect(api.delete).not.toHaveBeenCalled();
  });

  it('devrait afficher un toast d\'erreur si la suppression échoue', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    global.confirm.mockReturnValue(true);

    api.delete.mockRejectedValue(new Error('Erreur de suppression'));

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    await wrapper.find('button.btn-danger').trigger('click');
    await flushPromises();

    expect(mockShowToast).toHaveBeenCalledWith('Erreur lors de la suppression.', 'error');
  });

  it('devrait permettre à l\'administrateur d\'ajouter une nouvelle image', async () => {
    useUserStore.mockReturnValue({
      user: { id: 1, role: 'admin' },
      isLoggedIn: true
    });

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    await flushPromises();

    const initialImagesCount = wrapper.vm.hotel.images.length;

    await wrapper.find('button.btn-secondary').trigger('click');

    expect(wrapper.vm.hotel.images.length).toBe(initialImagesCount + 1);
    expect(wrapper.vm.hotel.images[initialImagesCount]).toBe("");
  });

  it('devrait correctement formater des dates', () => {
    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    const testDate = new Date(2023, 11, 25);
    expect(wrapper.vm.formatDate(testDate)).toBe('2023-12-24');
  });


  it('devrait initialiser les dates de réservation avec aujourd\'hui et demain', () => {
    const RealDate = global.Date;
    const mockDate = new RealDate(2023, 11, 10);

    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(mockDate);
        } else {
          super(...args);
        }
      }

      static now() {
        return mockDate.getTime();
      }
    };

    wrapper = mount(ConsultHotel, {
      props: { id: 123 },
      global: {
        stubs: {
          'toast-message': {
            template: '<div></div>',
            methods: { showToast: mockShowToast }
          }
        }
      }
    });

    const today = '2023-12-10';
    const tomorrow = '2023-12-11';
    expect(wrapper.vm.startDate).toBe(today);
    expect(wrapper.vm.endDate).toBe(tomorrow);
    global.Date = RealDate;
  });
});
