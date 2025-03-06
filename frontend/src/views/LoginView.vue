<script setup lang="ts">
import InputText from 'primevue/inputtext';
</script>

<template>
  <Form v-slot="$form" class="flex justify-center flex-col gap-4">
    <div class="flex flex-col gap-1">
      <InputText name="username" type="text" placeholder="Username" />
      <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">{{ $form.username.error?.message }}</Message>
    </div>
    <div class="flex flex-col gap-1">
      <InputText name="email" type="text" placeholder="Email" />
      <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
    </div>
    <Button type="submit" severity="secondary" label="Submit" />
  </Form>
</template>
<style scoped>
</style>
