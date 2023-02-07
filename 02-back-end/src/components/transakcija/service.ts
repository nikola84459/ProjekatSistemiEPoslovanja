import * as mysql2 from 'mysql2/promise';
import TransakcijaModel, { RacunTransakcija } from './model';
import RacunModel from '../racun/model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import RacunService from '../racun/service';
import ValutaService from '../valuta/service';
import BaseService from '../../../common/BaseService';
import ValutaModel from '../valuta/model';



export default class TransakcijaService extends BaseService<TransakcijaModel> {
    private racunId;
    
    protected async adaptModel(row: any): Promise<TransakcijaModel> {
        const item = new TransakcijaModel();

        item.transakcija_id = +(row?.transakcija_id);
        item.br_transakcije = row?.br_transakcije;
        item.iznos = row?.iznos;
        item.datum_i_vreme = new Date(row?.datum_i_vreme);
        item.svrha = row?.svrha;
        item.valuta_id = +(row.valuta_id);
        item.racunTransakcija = await this.getByTip(item.transakcija_id, this.racunId);
        const valute = await this.getServices().valutaService.getBayId(item.valuta_id);
        
        if(valute instanceof ValutaModel) {
            item.valuta = valute; 
        }    
                
        return item;        
    }

    public async getById(id: number): Promise<TransakcijaModel | IErrorResponse | null> {
        return await this.getByIdFromTable(
            id,
            "transakcija",
        )
    }

    public async getByRacunId(id: number): Promise<TransakcijaModel[] | null> {
        this.racunId = id;
        const transakcije: TransakcijaModel[] = [];
        const sql = `SELECT 
                        transakcija.transakcija_id,
                        transakcija.br_transakcije,
                        transakcija.iznos,
                        transakcija.datum_i_vreme,
                        transakcija.svrha,
                        transakcija.valuta_id 
                    FROM 
                        racun_transakcija
    
                    INNER JOIN transakcija ON racun_transakcija.transakcija_id = transakcija.transakcija_id
    
                    WHERE 
                        racun_transakcija.racun_id = ?
                    ORDER by
                        datum_i_vreme DESC`
        const [rows] = await this.db.execute(sql, [id]);

        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }
                
        if(Array.isArray(rows)) {
            for(const row of rows) {
                 transakcije.push (
                     await this.adaptModel (
                        row
                     )
                 )
             }
         }
         
         return transakcije;
    }

    public async getByTip(transakcijaId: number, racunId: number): Promise<RacunTransakcija | null> {
        const sql = `SELECT
                        *
                    FROM 
                        racun_transakcija
                    WHERE
                        racun_transakcija.transakcija_id = ? AND racun_transakcija.racun_id = ?`
        const [ rows ] = await this.db.execute(sql, [transakcijaId, racunId]);

        return ({
            racun_transakcija_id: +(rows[0]?.racun_transakcija_id),
            transakcija_id: rows[0]?.transakcija_id,
            racun_id: rows[0]?.racun_id,
            tip: rows[0]?.tip  
        })
    }

    public async add(brTransakcija: string, iznos: number, datumIVreme: string, svrha: string, racunIdPlatioca: number, racunIdPrimaoca: number,
                    tipUplata: string, tipIsplata: string, valuta: number, valuta1: number, novoStanjePlatioca: number, novoStanjePrimaoca: number
        ): Promise<TransakcijaModel | IErrorResponse> {
        return new Promise <TransakcijaModel | IErrorResponse>(reslove => {
            this.db.beginTransaction()
            .then(async () => {
                const sql = `INSERT 
                                transakcija
                            SET
                                br_transakcije = ?,
                                iznos = ?,
                                datum_i_vreme = ?,
                                svrha = ?,
                                valuta_id = ?`
                
                this.db.execute(sql, [brTransakcija, iznos, datumIVreme, svrha, valuta])
                .then(async (p: any) => {
                    const transakcijaId = +(p[0]?.insertId)
                    this.racunId = racunIdPlatioca;

                    const obecanja = [];
                                
                    obecanja.push(
                        this.db.execute(
                            `INSERT
                                racun_transakcija
                            SET
                                racun_transakcija.transakcija_id = ?,
                                racun_transakcija.racun_id = ?,
                                racun_transakcija.tip = ?`,
                            [transakcijaId, racunIdPlatioca, tipIsplata]    
                                
                        )
                    );
                                               
                    obecanja.push(
                        this.db.execute(
                            `INSERT
                                racun_transakcija
                            SET
                                racun_transakcija.transakcija_id = ?,
                                racun_transakcija.racun_id = ?,
                                racun_transakcija.tip = ?`,
                            [transakcijaId, racunIdPrimaoca, tipUplata]    
                                
                        )
                    );
                    
                    
                    if(valuta1 !== null) {
                        obecanja.push(this.getServices().racunService.editStanje(novoStanjePrimaoca, valuta ,racunIdPrimaoca));
                        obecanja.push(this.getServices().racunService.editStanje(novoStanjePlatioca, valuta1 ,racunIdPlatioca));
                    } else {
                        obecanja.push(this.getServices().racunService.editStanje(novoStanjePlatioca, valuta ,racunIdPlatioca));
                        obecanja.push(this.getServices().racunService.editStanje(novoStanjePrimaoca, valuta ,racunIdPrimaoca));    
                    }                          
                    
                    
                    Promise.all(obecanja)
                    .then(async () => {
                        this.db.commit();
                        
                        reslove(await this.getById(transakcijaId));
                    })
                    .catch(async error => {
                        await this.db.rollback();

                        reslove({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        });
                    })

                    
                })
                .catch(async error => {
                    await this.db.rollback();

                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });

                })
            })
            
        });
    }

    public async addIsplata(brTransakcija: string, iznos: number, datumIVreme: string, tip: string, valutaId: number, stanje: number, racunId: number): Promise<TransakcijaModel | IErrorResponse> {
        return new Promise<TransakcijaModel | IErrorResponse>(reslove => {
            this.db.beginTransaction()
            .then(async () => {
                const sql = `INSERT INTO
                                transakcija
                            SET
                                br_transakcije = ?,
                                iznos = ?,
                                datum_i_vreme = ?,
                                svrha = ?,
                                valuta_id = ?`
                this.db.execute(sql, [brTransakcija, iznos, datumIVreme, "", valutaId])
                .then(async (res: any) => {
                    const transakcijaId = +(res[0]?.insertId);
                    this.racunId = racunId;
                    const obecanje = [];

                    obecanje.push(
                        this.db.execute(
                            `INSERT INTO
                                racun_transakcija
                            SET
                                racun_transakcija.transakcija_id = ?,
                                racun_transakcija.racun_id = ?,
                                racun_transakcija.tip = ?`,   
                            [transakcijaId, racunId, tip]                           
                        )
                    );

                    obecanje.push(this.getServices().racunService.editStanje(stanje, valutaId, racunId))

                    Promise.all(obecanje)
                    .then(async () => {
                        this.db.commit();
                                                
                        reslove(await this.getById(transakcijaId));
                    })
                    .catch(async err => {
                        await this.db.rollback();

                        reslove({
                            errorCode: err?.errno,
                            errorMessage: err?.sqlMessage
                        });    
                    })
                }) 
                .catch(async err => {
                    await this.db.rollback();

                    reslove({
                        errorCode: err?.errno,
                        errorMessage: err?.sqlMessage
                    });      
                })            
            })
        })
    }
   
}