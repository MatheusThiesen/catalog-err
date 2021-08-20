import * as laMartina from "./laMartina";
import * as usPolo from "./usPolo";

export interface CatalagoProps {
  pagina: number;
  referencia?: string;
  caracteristicas?: string;
  composicao?: string;
  grade?: string;
  cor?: string;

  fotoPrincipal: string | undefined;
  fotoDetalhe: string | undefined;
  fotoStatic?: string | undefined;

  cores: CoresProps[];

  staticImage?: boolean;
}

export interface CoresProps {
  tipo: number;
  cor: string;
  filename: string;
}

export default {
  usPolo: usPolo.generateHtml,
  laMartina: laMartina.generateHtml,
};
