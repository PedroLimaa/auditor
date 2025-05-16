<template>
  <v-container class="bg-neutral-300">
    <v-card class="mx-4 my-6">
      <v-card-title> Correção de NCM </v-card-title>
      <v-card-item class="my-2">
        <p>Correção de NCM baseado em um banco de dados fornecido</p>
      </v-card-item>
    </v-card>
    <v-file-input
      v-model="excelBd"
      label="Banco de dados com NCMs preenchidos (Descrição | NCM)"
      @change="uploadBd"
      accept=".xlsx, .xls" />
    <v-file-input
      v-model="excelCorrecao"
      label="Arquivo de produtos para correção (Codigo | Descrição | NCM)"
      @change="uploadProdutos"
      accept=".xlsx, .xls" />
    <div v-if="itemsBd.length > 0 && itemsCorrecao.length > 0" class="my-2">
      <v-btn @click="comparar" block color="primary" dark>Comparar</v-btn>
    </div>
    <div v-if="loading">Carregando!</div>

    <v-divider class="my-2"></v-divider>
    <v-row>
      <v-col v-if="itemsBd.length > 0 && itemsCorrecao.length > 0">
        <v-card class="my-4">
          <v-card-title> Informações </v-card-title>
          <v-card-item>
            Total de itens no banco de dados: {{ itemsBd.length }}
          </v-card-item>
          <v-card-item>
            Total de itens para correção: {{ itemsCorrecao.length }}
          </v-card-item>
        </v-card>
      </v-col>
      <v-col v-if="itensCorrigidos.length > 0 || itensNaoCorrigidos.length > 0">
        <v-card class="my-4">
          <v-card-title> Resultado </v-card-title>
          <v-card-item>
            Total de itens corrigidos: {{ itensCorrigidos.length }}
          </v-card-item>
          <v-card-item>
            Total de itens não corrigidos: {{ itensNaoCorrigidos.length }}
          </v-card-item>
          <v-card-item>
            Total de itens com NCM não encontrados:
            {{ itensNaoEncontrados.length }}
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
    <v-btn
      block
      v-if="baseCorrigida.length > 0"
      color="success"
      @click="gerarExcel"
      >Gerar excel</v-btn
    >
  </v-container>
</template>

<script setup>
  import readXlsxFile from "read-excel-file";
  import writeXlsxFile from "write-excel-file";
  import { findBestMatch } from "string-similarity";
  const excelBd = ref([]);
  const excelCorrecao = ref([]);
  const itemsBd = ref([]);
  const itemsCorrecao = ref([]);
  const { currentTime } = useCurrentTime();
  const { $toast } = useNuxtApp();
  const rows = [];
  const loading = ref(false);
  const itensCorrigidos = [];
  const itensNaoCorrigidos = [];
  const itensNaoEncontrados = [];
  const baseCorrigida = ref([]);
  const header = [
    { value: "cod", fontWeight: "bold" },
    { value: "descricao", fontWeight: "bold" },
    { value: "ncm", fontWeight: "bold" },
    { value: "ncm origem", fontWeight: "bold" },
  ];

  const uploadBd = async () => {
    itemsBd.value = [];
    readXlsxFile(excelBd.value).then((rows) => {
      rows.forEach((row, index) => {
        if (index > 0) {
          itemsBd.value.push({
            descricao: row[0],
            ncm: row[1],
          });
        }
      });
    });
  };

  const uploadProdutos = async () => {
    itemsCorrecao.value = [];
    readXlsxFile(excelCorrecao.value).then((rows) => {
      rows.forEach((row, index) => {
        if (index > 0) {
          itemsCorrecao.value.push({
            codigo: row[0],
            descricao: row[1],
            ncm: row[2],
          });
        }
      });
    });
  };

  const comparar = () => {
    loading.value = true;
    const resultado = preencherNcm(itemsCorrecao.value, itemsBd.value);
    baseCorrigida.value = resultado;
  };

  const preencherNcm = (
    produtosParaCorrigir,
    bancoDeDados,
    descricaoKey = "descricao",
    ncmKey = "ncm"
  ) => {
    return produtosParaCorrigir.map((produto) => {
      const descricaoRaw = produto[descricaoKey];
      const descricao =
        typeof descricaoRaw === "string"
          ? descricaoRaw.toLowerCase().trim()
          : "";

      const ncmAtual = produto[ncmKey]?.toString().trim();

      if (ncmAtual) {
        produto.origemNcm = `Original (NCM: ${ncmAtual})`;
        itensNaoCorrigidos.push(produto);
        return produto;
      }

      const candidatos = bancoDeDados.filter((p) => {
        const desc = p[descricaoKey];
        return (
          p[ncmKey] && typeof desc === "string" && desc.toLowerCase().trim()
        );
      });

      if (candidatos.length === 0 || !descricao) {
        produto.origemNcm = "NCM não encontrado no banco de dados";
        itensNaoEncontrados.push(produto);
        return produto;
      }

      const descricoes = candidatos.map((p) =>
        p[descricaoKey].toLowerCase().trim()
      );
      const resultado = findBestMatch(descricao, descricoes);

      if (resultado.bestMatch.rating < 0.4) {
        produto.origemNcm = "Sem correspondência com confiança mínima";
        itensNaoEncontrados.push(produto);
        return produto;
      }
      const melhorIndice = resultado.bestMatchIndex;
      const produtoSimilar = candidatos[melhorIndice];

      const ncmSugerido = produtoSimilar[ncmKey];
      produto[ncmKey] = ncmSugerido.toString();
      produto.origemNcm = `Sugerido (NCM: ${ncmSugerido}) com base em "${produtoSimilar[descricaoKey]}"`;
      itensCorrigidos.push(produto);
      return produto, itensCorrigidos, itensNaoCorrigidos, itensNaoEncontrados;
    });
  };

  const gerarExcel = async () => {
    rows.length = 0;
    const fileName = currentTime.value;
    rows.push(header);
    itemsCorrecao.value.forEach((item) => {
      const row = [
        { type: Number, value: Number(item.codigo) },
        { type: String, value: String(item.descricao || "") },
        { type: String, value: String(item.ncm || "") },
        { type: String, value: String(item.origemNcm || "") },
      ];
      rows.push(row);
    });
    try {
      await writeXlsxFile(rows, { fileName: `${fileName}.xlsx` });
      $toast.success("Arquivo gerado com sucesso!");
    } catch (error) {
      $toast.error(
        "Erro ao gerar arquivo excel. por favor, verifique seu arquivo de produtos e tente novamente"
      );
      console.log(error);
    }
  };
</script>
