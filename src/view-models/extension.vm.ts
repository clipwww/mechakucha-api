import { Request, Response } from 'express';
import { ResultVM, ResultListGenericVM, ResultGenericVM } from './result.vm';

export interface RequestExtension extends Request {
  params: {
    [key: string]: string
  };

  cookies: {
    [key: string]: any
  };
}

export interface ResponseExtension extends Response {
  result?: ResultVM | ResultGenericVM<any> | ResultListGenericVM<any>;

}
