<template>
  <v-container grid-list-xs class="bg-neutral-300 pa-16">
    <v-card color="">
      <v-card-title primary-title> Auditor Fiscal </v-card-title>
      <v-card-item>
        <p>
          Esse sistema compara dois arquivos excel e gera um terceiro com base
          na comparação dos arquivos.
        </p>
        <br />
        <p>O primeiro arquivo é o anexo 1 de substituição tributária</p>
        <br />
        <p>
          O segundo arquivos é uma base de produtos com as colunas Codigo e NCM
        </p>
      </v-card-item>
      <div class="pa-4 text-center">
        <v-btn
          href="/auditor"
          color="primary"
          appendIcon="mdi-arrow-top-right-thick"
          >Auditor</v-btn
        >
      </div>
    </v-card>
  </v-container>
</template>
<script setup></script>
