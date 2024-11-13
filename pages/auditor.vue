<template>
  <v-container class="bg-neutral-300">
    <v-card class="mx-4 my-6">
      <v-card-title> Auditor Fiscal </v-card-title>
      <v-card-item class="my-2">
        <p>
          Anexo 1 de Substituição Tributária é o arquivo que contém as regras de
          substituição tributária e os detalhes necessários para comparar a
          tributação.
        </p>
        <br />
        <p>
          A base de produtos deve conter as colunas obrigatórias: Código, NCM e
          CSO nessa ordem.
        </p>
        <br />
        <p>Ambos no formato Excel (.xlsx).</p>
      </v-card-item>
    </v-card>
    <v-file-input
      v-model="excelFileAnexo"
      label="Anexo 1 substituição tributária"
      @change="uploadAnexo1"
      accept=".xlsx, .xls" />
    <v-file-input
      v-model="excelFileProduto"
      label="Arquivo de produtos (Codigo | NCM | CSO)"
      @change="uploadProdutos"
      accept=".xlsx, .xls" />
    <div class="flex justify-center align-center">
      <div v-if="itemsAnexo1.length > 0" class="mr-10">
        Numero de NCMs no anexo: {{ numeroNcmAnexo }}
      </div>
      <div v-if="itemsProdutos.length > 0">
        Numero de Produtos: {{ itemsProdutos.length }}
      </div>
    </div>
    <div v-if="itemsAnexo1.length > 0 && itemsProdutos.length > 0" class="ma-4">
      <v-btn color="primary" @click="gerarExcel" block>Gerar arquivo</v-btn>
    </div>
    <div v-if="produtosCorrigidos.length > 0" class="mx-4 my-6">
      <v-card>
        <v-card-title primary-title> Resultado </v-card-title>
        <div class="flex justify-center align-center">
          <!--           <div class="ma-2">
            Produtos com a tributação correta:
            <v-chip color="green" size="large">{{
              comparacao.tributacaoIgual
            }}</v-chip>
          </div> -->
          <div class="mb-4">
            <v-chip color="green" size="large" elevation="5" class="mr-4">{{
              tributacaoDiferente
            }}</v-chip>
            Produtos corrigidos
          </div>
        </div>
      </v-card>
    </div>
    <pre></pre>
  </v-container>
</template>
<script setup>
  import readXlsxFile from "read-excel-file";
  import writeXlsxFile from "write-excel-file";
  import { compararNcm, compararProdutos } from "~/utils/comparacao";
  const { $toast } = useNuxtApp();
  const { currentTime } = useCurrentTime();
  const excelFileAnexo = ref([]);
  const excelFileProduto = ref([]);
  const itemsAnexo1 = ref([]);
  const itemsProdutos = ref([]);
  const produtosCorrigidos = ref([]);
  const tributacaoDiferente = ref({});

  const numeroNcmAnexo = computed(() => {
    let numeroNcm = 0;
    itemsAnexo1.value.forEach((row, index) => {
      if (index > 0) {
        if (row.ncm) {
          numeroNcm += 1;
        }
      }
    });
    return numeroNcm;
  });

  const uploadAnexo1 = async () => {
    readXlsxFile(excelFileAnexo.value).then((rows) => {
      rows.forEach((row, index) => {
        if (index > 0) {
          itemsAnexo1.value.push({
            id: row[0],
            cest: row[1],
            ncm: row[2],
            descricao: row[3],
            acordos: row[4],
            mva_ajustada: row[5],
            mva_original: row[6],
          });
        }
      });
    });
  };
  const uploadProdutos = async () => {
    readXlsxFile(excelFileProduto.value).then((rows) => {
      rows.forEach((row, index) => {
        if (index > 0) {
          itemsProdutos.value.push({
            cod: row[0],
            ncm: row[1],
            cso: row[2],
          });
        }
      });
    });
  };

  const gerarExcel = async () => {
    const resultadoComparacao = compararNcm(
      itemsAnexo1.value,
      itemsProdutos.value
    );
    produtosCorrigidos.value = resultadoComparacao;

    const produtosComparados = compararProdutos(
      itemsProdutos.value,
      resultadoComparacao
    );
    tributacaoDiferente.value = produtosComparados.tributacaoDiferente;

    const rows = [];
    const header = [
      { value: "cod", fontWeight: "bold" },
      { value: "ncm", fontWeight: "bold" },
      { value: "cst", fontWeight: "bold" },
      { value: "cso", fontWeight: "bold" },
      { value: "cfop", fontWeight: "bold" },
    ];
    rows.push(header);
    resultadoComparacao.forEach((item) => {
      let row = [];
      row.push(
        { type: Number, value: item.cod },
        { type: Number, value: item.ncm },
        { type: String, value: item.cst },
        { type: String, value: item.cso },
        { type: String, value: item.cfop }
      );
      rows.push(row);
    });
    const fileName = currentTime.value;
    try {
      await writeXlsxFile(rows, { fileName: `${fileName}.xlsx` });
      itemsProdutos.value = [];
      $toast.success("Arquivo gerado com sucesso!");
    } catch (error) {
      $toast.error(
        "Erro ao gerar arquivo excel. por favor, verifique seu arquivo de produtos e tente novamente"
      );
    }
  };
</script>
