import React from "react";
import { Table, Container } from "react-bootstrap";
import RacunModel from "../../../../03-back-end/src/components/racun/model";
import RacunService from "../../services/RacunService";
import BasePage from "../BasePage/BasePage";
import "./racuni.css"
import { Link, Redirect } from 'react-router-dom';
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from '../../Api/EventRegister';
import { addAktivnost } from '../../Dnevnik/Dnevnik';

class RacunPageState {
    racunDinarski: RacunModel[] | null;
    racunDevizni: RacunModel[] | null;
    isDevizni: boolean;
    isUlogovan: boolean | null;
    
    
    
}

export default class RacuniPage extends BasePage<{}> {
    state: RacunPageState;
    podaci: RacunModel | null = null;
   
    
    constructor(props: any) {
        super(props)

        this.state = {
            racunDinarski: null,
            racunDevizni: null,
            isDevizni: false,
            isUlogovan: null
            
        }
    }  
    
    private getRacun() {
        RacunService.getRacuniByKorisnik()
        .then(res => {
            let racunDi = [];
            let racunDe = []; 
            let devizni = false;

            for(const i of res) {
                if(i.tip === "dinarski") {
                    racunDi.push(i);
                } else if (i.tip === "devizni") {
                    racunDe.push(i);
                    devizni = true;
                    
                }
            }
            
            this.setState({
                    racunDinarski: racunDi,
                    racunDevizni: racunDe, 
                    isDevizni: devizni  
                })
        })
       
    }

       
    componentDidMount() {
        isUlogaUlogovana("korisnik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login");
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
            }
            this.getRacun();
        }) 

                
        addAktivnost(window.location.href, "Pregled računa, početna stranica", "korisnik");
    }
  
    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaKorisnik"} />
        }
        
        return (
            <>
            <Container>
                <h3 className="dracun">Dinarski računi</h3>
                <Table className="racuniTabela" striped bordered hover>
                    <thead>
                        <tr>
                            <th>Broj računa</th>
                            <th>Tip</th>
                            <th>Stanje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.racunDinarski?.map(ra => (
                            <tr>
                                <td><Link to={"/pregledTransakcija/" + ra.racun_id}>{ra.br_racuna}</Link></td>
                                <td>{ra.tip}</td>
                                <td>{ra.racun_valuta[0].stanje} <b>RSD</b></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {this.state.isDevizni ? (
                    <>
                        <h3 className="deracuni">Devizni računi</h3>
                        <Table className="dRacuniTabela" striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Broj računa</th>
                                    <th>Tip</th>
                                    <th>Stanje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.racunDevizni?.map(ra => (
                                    <tr>
                                        <td><Link to={"/pregledTransakcija/" + ra.racun_id}>{ra.br_racuna}</Link></td>
                                        <td>{ra.tip}</td>
                                        <td>
                                            <Table>
                                                {ra.racun_valuta.map(v => (
                                                    <td>{v.stanje} <b>{v.valutaa.sifra.toLocaleUpperCase()}</b></td>
                                                    
                                                ))}
                                            </Table>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                ) : ""}

            </Container>
            </>
        )
    }
}