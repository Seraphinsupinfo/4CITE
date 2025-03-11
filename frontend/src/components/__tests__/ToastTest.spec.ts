// @ts-nocheck

import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ToastMessage from "@/components/toastMessage.vue";

const flushTimers = async (ms) => {
  await vi.advanceTimersByTimeAsync(ms);
};

describe('ToastComponent', () => {
  vi.useFakeTimers();

  it('affiche un toast et le supprime après 5 secondes', async () => {
    const wrapper = mount(ToastMessage);
    wrapper.vm.showToast('Test message', 'success');

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Test message');

    await flushTimers(5000);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Test message');
  });

  it('affiche plusieurs toasts en même temps', async () => {
    const wrapper = mount(ToastMessage);
    wrapper.vm.showToast('Toast 1', 'success');
    wrapper.vm.showToast('Toast 2', 'error');

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Toast 1');
    expect(wrapper.text()).toContain('Toast 2');
  });

  it('supprime un toast manuellement', async () => {
    const wrapper = mount(ToastMessage);
    wrapper.vm.showToast('Toast to remove', 'info');

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Toast to remove');

    wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Toast to remove');
  });
});
