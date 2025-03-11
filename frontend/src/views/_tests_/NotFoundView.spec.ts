// @ts-nocheck
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

import { useRouter } from 'vue-router';
import NotFoundView from "@/views/NotFoundView.vue";

describe('NotFoundView.vue', () => {
  let wrapper;
  const mockRouter = {
    push: vi.fn()
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'setInterval');
    vi.mocked(useRouter).mockReturnValue(mockRouter);

    wrapper = mount(NotFoundView);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait afficher correctement la page 404', () => {
    // Vérifier les éléments principaux
    expect(wrapper.find('.error-container').exists()).toBe(true);
    expect(wrapper.find('.error-code').text()).toBe('404');
    expect(wrapper.find('.error-title').text()).toBe('Chambre non trouvée');
    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.btn-return').exists()).toBe(true);
  });

  it('devrait afficher correctement le message d\'erreur', () => {
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.text()).toContain('Il semble que la page que vous recherchez n\'existe pas');
  });

  it('devrait afficher le bouton de retour à l\'accueil avec le texte correct', () => {
    const returnButton = wrapper.find('.btn-return');
    expect(returnButton.text()).toContain('Retour à l\'accueil');
  });

  it('devrait afficher le compte à rebours initial à 5', () => {
    expect(wrapper.find('.countdown').text()).toBe('(5)');
    expect(wrapper.find('.redirect-message').text()).toContain('5 secondes');
  });

  it('devrait décrémenter le compte à rebours à chaque seconde', async () => {
    expect(wrapper.vm.countdown).toBe(5);

    // Avancer d'une seconde
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.vm.countdown).toBe(4);

    // Avancer de deux secondes supplémentaires
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(wrapper.vm.countdown).toBe(2);
  });

  it('devrait rediriger vers l\'accueil quand le compte à rebours atteint 0', async () => {
    expect(mockRouter.push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    await nextTick();

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('devrait rediriger vers l\'accueil quand on clique sur le bouton de retour', async () => {
    const returnButton = wrapper.find('.btn-return');
    await returnButton.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('devrait appeler setInterval lors du montage', () => {
    expect(setInterval).toHaveBeenCalled();
  });

  it('devrait avoir 3 éléments clés d\'hôtel', () => {
    const keys = wrapper.findAll('.hotel-keys .key');
    expect(keys.length).toBe(3);
  });

  it('devrait avoir une icône d\'hôtel', () => {
    const hotelIcon = wrapper.find('.hotel-icon svg');
    expect(hotelIcon.exists()).toBe(true);
  });

  it('devrait avoir un séparateur après le code d\'erreur', () => {
    const divider = wrapper.find('.error-divider');
    expect(divider.exists()).toBe(true);
  });

  it('devrait afficher un message de redirection', () => {
    const redirectMessage = wrapper.find('.redirect-message');
    expect(redirectMessage.exists()).toBe(true);
    expect(redirectMessage.text()).toContain('Vous serez automatiquement redirigé');
  });


  it('ne devrait pas afficher de compte à rebours si celui-ci est inférieur ou égal à 0', async () => {
    // Définir manuellement le compte à rebours à 0
    wrapper.vm.countdown = 0;
    await nextTick();

    expect(wrapper.find('.countdown').exists()).toBe(false);
  });
});
