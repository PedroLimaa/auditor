import type { Anexo } from "~/interface/anexo";
import type { Produto } from "~/interface/produto";

export const compararNcm = (anexo: Anexo[], produto: Produto[]) => {
  const normalizarNcm = (ncm: any, digitos = 4) => {
    if (!ncm) return [];

    const ncmList = ncm.toString().split("\n");

    return ncmList.map((ncmA: string) => ncmA.split(".")[0]);
  };

  const ncmAnexo = anexo.flatMap((item) => normalizarNcm(item.ncm));

  const produtoNcm = produto.map((item) => {
    let newNcm = item.ncm?.toString().slice(0, 4);

    let isSubs = ncmAnexo.filter((ncm1) => newNcm?.includes(ncm1));
    let cst = "000";
    let cso = "102";
    let cfop = "5.102";
    if (isSubs.length > 0) {
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

  return produtoNcm;
};
