// @ts-nocheck

import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import WebsiteFooter from '@/components/WebsiteFooter.vue';

describe('WebsiteFooter.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(WebsiteFooter);
  });

  it('contient un élément <footer>', () => {
    expect(wrapper.find('footer').exists()).toBe(true);
  });
});
