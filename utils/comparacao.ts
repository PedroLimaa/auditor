import type { Anexo } from "~/interface/anexo";
import type { Produto } from "~/interface/produto";

export const compararNcm = (ncmAnexo: Anexo[], produtosDb: Produto[]) => {
  const ncmArray = [];
  const normalizarNcm = (ncm: any) => {
    if (!ncm) return [];
    const quebrarNcm = ncm.toString().split("\n");
    if (quebrarNcm.length > 1) {
      ncmArray.push(quebrarNcm);
    }
    const ncmTratado = quebrarNcm.map((ncmA: string) =>
      ncmA.replace(/\./g, "")
    );

    return ncmTratado;
  };

  const ncmTratados = ncmAnexo.flatMap((item) => normalizarNcm(item.ncm));

  const ncmCorespondente = (ncmProduto: string | undefined) => {
    return ncmTratados.some((ncmTratado) => {
      const tamanho = ncmTratado.length;
      if (tamanho >= 4 && tamanho <= 6) {
        return ncmProduto?.startsWith(ncmTratado);
      }
      return ncmProduto === ncmTratado;
    });
  };

  const produtosCorrigidos = produtosDb.map((item) => {
    let ncmProduto = item.ncm?.toString();
    const correspondencia = ncmCorespondente(ncmProduto);

    let cst = "000";
    let cso = "102";
    let cfop = "5.102";
    if (correspondencia) {
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
  // const mainStore = useMainStore();
  // const {switchState} = storeToRefs(mainStore);
  let tributacaoIgual = 0;
  let tributacaoDiferente = 0;
  const codProdutoDiferente: number[] = [];
  const produtosCorretos: Produto[] = [];
  const produtosIncorretos: Produto[] = [];

  produtosDb.map((produto) => {
    let cso = produto.cso?.toString();
    let codProdutoDb = produto.cod;
    const produtoAuditado = produtosCorrigidos.filter(
      (produto) => produto.cod === codProdutoDb
    )[0];

    let novoCso = produtoAuditado.cso?.toString();
    if (novoCso === cso) {
      tributacaoIgual += 1;
      produtosCorretos.push(produtoAuditado);
      return;
    }
    tributacaoDiferente += 1;
    produtosIncorretos.push(produtoAuditado);
    codProdutoDiferente.push(produtoAuditado.cod ?? 0);
  });
  return {
    tributacaoIgual,
    tributacaoDiferente,
    produtosCorretos,
    produtosIncorretos,
    codProdutoDiferente,
  };
};

