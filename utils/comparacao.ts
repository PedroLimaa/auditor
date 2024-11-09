import type { Anexo } from "~/interface/anexo";
import type { Produto } from "~/interface/produto";

export const compararNcm = (ncmAnexo: Anexo[], produtosDb: Produto[]) => {
  const normalizarNcm = (ncm: any, digitos = 4) => {
    if (!ncm) return [];

    const ncmList = ncm.toString().split("\n");

    return ncmList.map((ncmA: string) => ncmA.split(".")[0]);
  };

  const ncmTratados = ncmAnexo.flatMap((item) => normalizarNcm(item.ncm));

  const produtosCorrigidos = produtosDb.map((item) => {
    let metadeNcm = item.ncm?.toString().slice(0, 4);

    let correspondencia = ncmTratados.filter((ncmTratado) =>
      metadeNcm?.includes(ncmTratado)
    );
    let cst = "000";
    let cso = "102";
    let cfop = "5.102";
    if (correspondencia.length > 0) {
      cst = "060";
      cso = "500";
      cfop = "5.405";
    }
    return {
      ...item,
      cst,
      cso,
      cfop,
    };
  });
  return produtosCorrigidos;
};

export const compararProdutos = (
  produtosDb: Produto[],
  produtosCorrigidos: Produto[]
) => {
  let tributacaoIgual = 0;
  let tributacaoDiferente = 0;
  produtosDb.map((produto) => {
    let cso = produto.cso?.toString();
    const produtoCorrespondente = produtosCorrigidos.filter(
      (novoProduto) => novoProduto.cod === produto.cod
    )[0];
    let novoCso = produtoCorrespondente.cso?.toString();
    if (novoCso === cso) {
      tributacaoIgual += 1;
      return;
    }
    tributacaoDiferente += 1;
  });
  return { tributacaoIgual, tributacaoDiferente };
};
