import IModel from './IModel.interface';
import * as mysql2 from 'mysql2/promise';
import IModelAdapterOptions from './IModelAdapterOptions.interface';
import IErrorResponse from './IErrorResponse.interface';
import IApplicationResources from './IApplicationResources.interface';
import IServices from './Iservices.interface';
import TransakcijaModel from '../src/components/transakcija/model';

export default abstract class BaseService<ReturnModel extends IModel> {
    private resources: IApplicationResources;

    constructor(resources: IApplicationResources) {
        this.resources = resources;
    }

    protected get db() {
        return this.resources.databaseConnection;
    }

    protected getServices(): IServices {
        return this.resources.services
    }

    protected get getResources() {
        return this.resources;
    }

    protected abstract adaptModel(data: any, options: Partial<IModelAdapterOptions>): Promise<ReturnModel>;

    protected async getAllFromTable<AdapterOptions extends IModelAdapterOptions>(tabela: string, options: Partial<AdapterOptions> = {}): Promise<ReturnModel[] | IErrorResponse> {
        return new Promise<ReturnModel[] | IErrorResponse>(reslove => {
            const sql = `SELECT * FROM ${tabela}`
            this.db.execute(sql)
            .then(async res => {
                const rows = res[0];
                const lista: ReturnModel[] = [];

                if(Array.isArray(rows)) {
                    for(const row of rows) {
                        lista.push(
                            await this.adaptModel(row, options)
                        );
                    }
                }

                reslove(lista)
            })
            .catch(err => {
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
                })
            })

        })
    }

    protected async getByIdFromTable<AdapterOptions extends IModelAdapterOptions>(id: number, table: string, options: Partial<AdapterOptions> = {}): Promise<ReturnModel | null | IErrorResponse> {
        return new Promise<ReturnModel | null | IErrorResponse>(reslove => {
            const sql = `SELECT
                            *
                        FROM
                            ${table}
                        WHERE
                            ${table}_id = ?`
            this.db.execute(sql, [id])
            .then(async res => {
                const [ rows, columns ] = res;
                
                if(!Array.isArray(rows)) {
                    reslove(null);
                    return;
                }

                if(rows.length === 0) {
                    reslove(null);
                    return;
                }
                
                reslove(
                    await this.adaptModel(rows[0], options)
                );
            })
            .catch(err => {
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
                })
            })                
                                 
        })
    }
  

    protected async getByFieldName<AdapterOptions extends IModelAdapterOptions>(tabela: string, polje: string, vrednostPolje: string, options: Partial<AdapterOptions> = {}): Promise<ReturnModel | IErrorResponse | null> {
        return new Promise<ReturnModel | IErrorResponse | null>(reslove => {
            const sql = `SELECT 
                            *
                        FROM
                            ${tabela}
                        WHERE
                            ${polje} = ?;`
            this.db.execute(sql, [vrednostPolje])
            .then(async res => {
               const [ rows, columns ] = res;

                if(!Array.isArray(rows)) {
                    reslove(null);
                    return;
               }

                if(rows.length === 0) {
                    reslove(null);
                    return;
               }

               reslove(await this.adaptModel(rows[0], options))

            })
            .catch(err => {
                reslove({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage
                })
            })                       
        })
       
    }
}