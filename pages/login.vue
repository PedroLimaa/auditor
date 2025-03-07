<template>
  <v-form>
    <v-container fluid>
      <v-row>
        <v-col cols="6" sm="6">
          <v-text-field
            append-icon="mdi-account"
            type="text"
            class="input-group--focused"
            hint="At least 8 characters"
            label="Visible"
            name="input-10-2"
            @click:append="show2 = !show2"></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" sm="6">
          <v-text-field
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            hint="digite pelo menos 8 caracteres"
            label="Senha"
            counter
            @click:append="showPassword = !showPassword"></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script setup>
  const showPassword = ref(false);
  const password = ref("");
</script>
