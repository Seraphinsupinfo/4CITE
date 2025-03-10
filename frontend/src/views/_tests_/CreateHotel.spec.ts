import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CreateHotel from '../CreateHotel.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore.ts';
import api from '@/services/axiosConfig.ts';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

vi.mock('@/stores/UserStore.ts', () => ({
  useUserStore: vi.fn(() => ({
    user: {
      role: 'admin'
    }
  }))
}));

vi.mock('@/services/axiosConfig.ts', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('CreateHotel.vue', () => {
  let wrapper;
  let mockRouter;
  let mockUserStore;

  beforeEach(() => {
    vi.useFakeTimers();
    const mockDate = new Date(2023, 11, 10);
    vi.setSystemTime(mockDate);

    mockRouter = {
      push: vi.fn()
    };
    useRouter.mockReturnValue(mockRouter);

    mockUserStore = {
      user: {
        role: 'admin'
      }
    };
    useUserStore.mockReturnValue(mockUserStore);

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');

    wrapper = mount(CreateHotel);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('devrait rediriger vers la page d\'accueil si l\'utilisateur n\'est pas admin', async () => {
    mockUserStore.user.role = 'user';

    wrapper = mount(CreateHotel);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('devrait initialiser les valeurs par défaut correctement', () => {
    expect(wrapper.vm.hotelName).toBe('');
    expect(wrapper.vm.location).toBe('');
    expect(wrapper.vm.description).toBe('');
    expect(wrapper.vm.images).toEqual([]);

    expect(wrapper.vm.creationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(wrapper.vm.toastMessage).toBe('');
    expect(wrapper.vm.toastType).toBe('success');
  });


  it('devrait ajouter un champ d\'image vide lorsque le bouton est cliqué', async () => {
    expect(wrapper.vm.images.length).toBe(0);

    await wrapper.find('button[type="button"]').trigger('click');

    expect(wrapper.vm.images.length).toBe(1);
    expect(wrapper.vm.images[0]).toBe('');
  });

  it('devrait soumettre le formulaire avec les bonnes données', async () => {
    await wrapper.find('input[type="text"]').setValue('Hôtel de Test');
    await wrapper.findAll('input[type="text"]')[1].setValue('Paris, France');
    await wrapper.find('textarea').setValue('Une description de test');

    await wrapper.find('button[type="button"]').trigger('click');
    await wrapper.find('input[placeholder="Coller une URL d\'image"]').setValue('http://example.com/image.jpg');

    api.post.mockResolvedValue({ data: { id: 1 } });
    await wrapper.find('form').trigger('submit');

    expect(api.post).toHaveBeenCalledWith(
      '/hotels',
      expect.objectContaining({
        name: 'Hôtel de Test',
        location: 'Paris, France',
        description: 'Une description de test',
        images: ['http://example.com/image.jpg'],
      }),
      {
        headers: {
          Authorization: 'Bearer fake-token'
        }
      }
    );
    const callArgs = api.post.mock.calls[0][1];
    expect(callArgs.creationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });


  it('devrait afficher un message de succès et rediriger après création réussie', async () => {
    await wrapper.find('input[type="text"]').setValue('Hôtel de Test');
    await wrapper.findAll('input[type="text"]')[1].setValue('Paris, France');
    await wrapper.find('textarea').setValue('Une description de test');

    api.post.mockResolvedValue({ data: { id: 1 } });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.vm.toastType).toBe('success');
    expect(wrapper.vm.toastMessage).toBe('Hôtel créé avec succès !');

    vi.advanceTimersByTime(2000);

    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });

  it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
    await wrapper.find('input[type="text"]').setValue('Hôtel de Test');
    await wrapper.findAll('input[type="text"]')[1].setValue('Paris, France');
    await wrapper.find('textarea').setValue('Une description de test');

    api.post.mockRejectedValue(new Error('Erreur API'));

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.vm.toastType).toBe('error');
    expect(wrapper.vm.toastMessage).toBe('Erreur lors de la création de l\'hôtel.');
  });

  it('ne devrait pas inclure les champs d\'image vides', async () => {
    await wrapper.find('input[type="text"]').setValue('Hôtel de Test');
    await wrapper.findAll('input[type="text"]')[1].setValue('Paris, France');
    await wrapper.find('textarea').setValue('Une description de test');

    await wrapper.find('button[type="button"]').trigger('click');
    await wrapper.find('button[type="button"]').trigger('click');

    await wrapper.findAll('input[placeholder="Coller une URL d\'image"]')[0].setValue('http://example.com/image.jpg');
    await wrapper.findAll('input[placeholder="Coller une URL d\'image"]')[1].setValue('   '); // Espace vide

    api.post.mockResolvedValue({ data: { id: 1 } });
    await wrapper.find('form').trigger('submit');

    expect(api.post).toHaveBeenCalledWith(
      '/hotels',
      expect.objectContaining({
        images: ['http://example.com/image.jpg']
      }),
      expect.anything()
    );
  });
});
