import BasePage from '../BasePage/BasePage';
import { Card, Button, Form, Container, Spinner } from 'react-bootstrap';
import ValutaModel from '../../../../03-back-end/src/components/valuta/model';
import ValutaService from '../../services/ValutaServices';
import ReactToPrint from 'react-to-print';
import UgovorComponent from '../UgovorComponent/UgovorComponent';
import RacunService from '../../services/RacunService';
import KorisnikModel from '../../../../03-back-end/src/components/korisnik/model';
import KorisnikService from '../../services/KorisnikService';
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from '../../Api/EventRegister';
import { Redirect } from 'react-router-dom';
import getLocationAndIp, { addAktivnost } from '../../Dnevnik/Dnevnik';
import DnevnikService from '../../services/DnevnikService';
import NaslovComponent from '../NaslovComponent/NaslovComponent';
import "./dodavanjeRacunaPostojeciKorisnikComponent.css"

class DodajRacunPostojeciKorisnikComponenState {
    valuta: ValutaModel[] | null;
    tip: "dinarski" | "devizni" | undefined;
    valuteId: number[];
    unesiSvrhu: boolean;
    isUnetaSvrha: boolean;
    svrha: string;
    isPotpisao: string;
    racunId: number;
    brRacuna: string;
    korisnik: KorisnikModel | null;
    isUlogovan: boolean | null;
    isOtvaranje: boolean;
    isAktivacija: boolean;
    preusmeri: boolean;
}

export default class DodajRacunPostojeciKorisnikComponent extends BasePage<{}> {
    state: DodajRacunPostojeciKorisnikComponenState;
    valutaNiz: number[] = [];
    componentRef: any;

    constructor(props: any) {
        super(props);

        this.state = {
            tip: undefined,
            valuteId: [],
            valuta: null,
            unesiSvrhu: false,
            isUnetaSvrha: false,
            svrha: "",
            isPotpisao: "false",
            racunId: 0,
            brRacuna: "",
            korisnik: null,
            isUlogovan: null,
            isOtvaranje: false,
            isAktivacija: false,
            preusmeri: false
    
        }
    }

    private getValuta() {
        ValutaService.getAll()
        .then(res => {
            this.setState({
                valuta: res
            })
        })
    }

            
    componentDidMount(): void {
        isUlogaUlogovana("sluzbenik")
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
        })
        this.getValuta();
        addAktivnost(window.location.href, "Započeto dodavanje računa za postojećeg korisnika.", "sluzbenik");
    }

    componentWillUnmount(): void {
        addAktivnost(window.location.href, "Zavrseno otvaranje računa za postojećeg korisnika.", "sluzbenik");
    }

    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }

        if(this.state.preusmeri) {
            return <Redirect to={"/podaciKorisnik"} />
        }

        return (
            <Container>
                <NaslovComponent poruka='Dodavanje računa za postojećeg korisnika'/>
                <Card className='kartica'>
                {

                    this.state.tip === undefined ? (
                <><Card.Header as="h5">OTVARANJE RAČUNA</Card.Header>
                <Card.Body>
                        <Card.Title>Izaberite tip računa</Card.Title>
                        <Form>
                            <div key={`default-radio`} className="mb-3">
                                <Form.Check
                                    value={"dinarski"}
                                    type={"radio"}
                                    id={"kupovina"}
                                    label={"Dinarski račun"}
                                    name="tip"
                                    onChange={e => { this.uzmiPodatke(e); } } />

                                <Form.Check
                                    value={"devizni"}
                                    type={"radio"}
                                    label={"Devizni račun"}
                                    id={"prodaja"}
                                    name="tip"
                                    onChange={e => { this.uzmiPodatke(e); } } />
                            </div>
                        </Form>
                    </Card.Body></>
                ):
                !this.state.unesiSvrhu ? (
                <><Card.Header as="h5">OTVARANJE RAČUNA</Card.Header>
                <Card.Body>
                            <Card.Title>Izaberite valute računa</Card.Title>
                            <Form>
                                <div key={`default-checkbox`} className="mb-3">
                                    {this.state.tip === "dinarski" ? (
                                        <Form.Check
                                            value={""}
                                            type={"checkbox"}
                                            label={"rsd"}
                                            id={""}
                                            name="valuteId"
                                            disabled
                                            checked />
                                    ) :
                                        (
                                            this.state.valuta?.map(v => (
                                                this.state.tip !== "dinarski" ? ( 
                                                    v.sifra !== "rsd" ? (
                                                <Form.Check
                                                    value={v.valuta_id}
                                                    type={"checkbox"}
                                                    label={v.sifra}
                                                    id={""}
                                                    name="valuteId"
                                                    onChange={e => { this.uzmiCheckbox(e); } } />
                                                    ): ""
                                                ): ""    
                                            ))
                                        )}
                                    <Button onClick={() => { this.promeniStanje(); } } className="dugme" size="sm" variant="primary">
                                        Potvrdi
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body></>
                ): 
                !this.state.isUnetaSvrha ? (
                <><Card.Header as={"h5"}>OTVARANJE RAČUNA</Card.Header>
                <Card.Body>
                    <Card.Title>Svrha otvaranja računa</Card.Title>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                         <Form.Control name="svrha" onChange={e => { this.uzmiPodatke(e); } } type="text" placeholder="Unesite svrhu otvaranja računa" />
                         </Form.Group>
                    </Form>
                    <Button disabled = {this.state.isOtvaranje} onClick={() => { this.posaljiPodatke(); } } className="dugme" size="sm" variant="primary">
                    <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isOtvaranje}
                        />
                        {
                        !this.state.isOtvaranje ? (
                            "Otovri račun"
                        ) :
                            "Molimo sačekajte"
                        }
                    </Button>
                    </Card.Body></>
                ): 
                <><Card.Header as={"h5"}>USPEŠNO OTVOREN RAČUN</Card.Header><Card.Body>
                                        <Card.Title>Sada možete da odštampate ugovor za {this.state.tip} račun</Card.Title>
                                        <ReactToPrint
                                            trigger={() => <Button variant="link">Odštampaj ugovor</Button>}
                                            content={() => this.componentRef} />
                                        <div hidden>
                                            <UgovorComponent ime={this.state.korisnik?.ime} prezime={this.state.korisnik?.prezime} jmbg={this.state.korisnik?.jmbg}
                                                brLk={this.state.korisnik?.br_licne_karte} brRacuna={this.state.brRacuna} tip={this.state.tip}
                                                ref={el => (this.componentRef = el)} />
                                        </div>
                                        <Form>
                                            <div key={`default-radio`} className="mb-3">
                                                <Form.Check
                                                    value={"true"}
                                                    type={"radio"}
                                                    id={""}
                                                    label={"Korisnik potpisao ugovor"}
                                                    name="isPotpisao"
                                                    onChange={e => { this.uzmiPodatke(e); } } />
                                                <Form.Check
                                                    value={"false"}
                                                    type={"radio"}
                                                    label={"Korisnik nije potpisao ugovor"}
                                                    id={""}
                                                    name="isPotpisao"
                                                    onChange={e => { this.uzmiPodatke(e); } } />
                                            </div>
                                            <Button disabled = {this.state.isAktivacija} onClick={() => { this.posaljiIsPotpisao(); } } className="dugme" size="sm" variant="primary">
                                            <Spinner 
                                                as="span"
                                                animation="grow"
                                                size="sm"
                                                role="status"
                                                hidden = {!this.state.isAktivacija}
                                            />
                                            {
                                        !this.state.isAktivacija ? (
                                        "Završi"
                                        ) :
                                        "Molimo sačekajte"
                                        }
                                            </Button>
                                        </Form>
                                    </Card.Body></>             
                }
                </Card>
            </Container>  
                                               
        )
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    private uzmiCheckbox(e: any) {
        this.valutaNiz.push(e.target.value)
        this.setState({
            valuteId: this.valutaNiz
        })
    }

    private promeniStanje() {
        this.setState({
            unesiSvrhu: true
        })

        KorisnikService.getKorisnikSluzbenik()
        .then(res => {
            this.setState({
                korisnik: res
            })
        })
    }

    private posaljiPodatke() {
        this.setState({
            isOtvaranje: true
        })

        RacunService.addRacun({
            tip: this.state.tip,
            valuta: this.state.valuteId,
            svrha: this.state.svrha
        })
        .then(res => {
            if(res.success) {
                this.setState({
                    isUnetaSvrha: true,
                    racunId: res.racun.racunId,
                    brRacuna: res.racun.brRacuna,
                    isOtvaranje: false
                })

                addAktivnost(window.location.href, "Otvoren račun za postojećeg korisnika.", "sluzbenik");
            }              
        })
        
    }

    private posaljiIsPotpisao() {
        this.setState({
            isAktivacija: true
        })

        if(this.state.isPotpisao === "true") {
            RacunService.editIsAktivan(
                {
                    racunId: this.state.racunId
                
                }
            )
            .then(res => {
                if(res.success) {
                    this.setState({
                        preusmeri: true,
                        isAktivacija: false
                    })
                }
            })
        } else {
            RacunService.obrisiNijePotpisao({
                racunId: this.state.racunId
            })
            .then(res => {
                if(res.success){
                    this.setState({
                        preusmeri: true,
                        isAktivacija: false
                    })
                }
            })
        }
    }
}