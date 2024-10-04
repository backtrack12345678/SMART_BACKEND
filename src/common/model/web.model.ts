export class WebResponse<T> {
  status: string;
  message?: string | string[];
  data: T;
  paging?: Paging;
}

export class IAuth {
  id: string;
  role: string;
  unitKerjaId: number;
}

export class Paging {
  size: number;
  currentPage: number;
  totalPage: number;
}
