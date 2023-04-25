import BasePage from "../../BasePage/BasePage";
import { Card, Button, Form, Container, Table, Alert, Spinner } from "react-bootstrap"
import KorisnikModel from "../../../../../03-back-end/src/components/korisnik/model";
import RacunModel from '../../../../../03-back-end/src/components/racun/model';
import "./dodajRacun.css"
import ValutaModel from "../../../../../03-back-end/src/components/valuta/model";
import ValutaService from "../../../services/ValutaServices";
import RacunService from "../../../services/RacunService";
import ReactToPrint from 'react-to-print';
import UgovorComponent from "../../UgovorComponent/UgovorComponent";
import { Link, Redirect } from "react-router-dom"
import KorisnikService from "../../../services/KorisnikService";
import { isUlogaUlogovana } from "../../../Api/api";
import EventRegister from "../../../Api/EventRegister";
import getLocationAndIp from "../../../Dnevnik/Dnevnik";
import DnevnikService from '../../../services/DnevnikService';
import { addAktivnost } from '../../../Dnevnik/Dnevnik';
import NaslovComponent from "../../NaslovComponent/NaslovComponent";


class DodajRacunPageState {
    korisnik: KorisnikModel | null;
    valuta: ValutaModel[] | null
    racun: RacunModel[] | null;
    isOtvaranjeRacuna: boolean;
    tip: "dinarski" | "devizni" | undefined;
    valuteId: number[];
    svrha: string;
    isIzabraneValute: boolean;
    isOtvoren: boolean;
    isPotpisao: string;
    isZavrseno: boolean;
    brRacuna: string;
    racunId: number;
    isUlogovan: boolean | null;
    isUProcesu: boolean;
   
}

export default class DodajRacunPage extends BasePage<{}> {
    state: DodajRacunPageState;
    valutaNiz: any = [];
    componentRef: any;
                
    constructor(props: any) {
        super(props);

        this.state = {
            korisnik: null,
            valuta: null,
            racun: null,
            isOtvaranjeRacuna: false,
            tip: undefined,
            valuteId: [],
            svrha: "",
            isIzabraneValute: false,
            isOtvoren: false,
            isPotpisao: "false",
            isZavrseno: false,
            brRacuna: "",
            racunId: 0,
            isUlogovan: null,
            isUProcesu: false
        }
    }

    private getKorisnik() {
        KorisnikService.getKorisnikSluzbenik()
        .then(res => {
            this.setState({
                korisnik: res
            })
            this.getRacun();
        })
    }

    private getRacun() {
        RacunService.getByKorisnikIdSluzbenik()
        .then(res => {
            this.setState({
                racun: res
            })
      })
      
    }

    private getValute() {
        ValutaService.getAll()
        .then(res => {
            this.setState({
                valuta: res
            })
        })
    }

   
    componentDidMount() {
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
        this.getKorisnik(); 
        this.getValute();
        addAktivnost(window.location.href, "Službenik započeo dodavanje računa za novog korisnika.", "sluzbenik");
    }

    componentWillUnmount(): void {
        addAktivnost(window.location.href, "Službenik završio dodavanje računa za novog korisnika", "sluzbenik");
    }

      
    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }
        return (
            <Container>
                <NaslovComponent poruka="Dodavanje računa" />
                <Card className="podaciKorisnikIRacun">
                    {
                        !this.state.isOtvaranjeRacuna ? (
                        <>
                            <Card.Header as="h5">USPEŠNO STE KREIRALI NOVOG KORISNIKA!</Card.Header>
                            <Card.Body>
                                <Card.Title>Podaci dodatkog korisnika</Card.Title>
                                <Card.Text>

                                </Card.Text>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Ime</th>
                                            <td>{this.state.korisnik?.ime}</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th>Prezime</th>
                                            <td>{this.state.korisnik?.prezime}</td>
                                        </tr>
                                        <tr>
                                            <th>JMBG</th>
                                            <td>{this.state.korisnik?.jmbg}</td>
                                        </tr>
                                        <tr>
                                            <th>Broj lične karte</th>
                                            <td>{this.state.korisnik?.br_licne_karte}</td>
                                        </tr>
                                        <tr>
                                            <th>Broj telefona</th>
                                            <td>{this.state.korisnik?.br_telefon}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                {this.state.racun?.length === 0 ? (
                                    <Alert className="obavestenje" key="warning" variant="warning">Za ovog korisnika još uvek nije otvoren ni jedan račun.</Alert>

                                ) :
                                    <>
                                        <h5>Računi korisnika</h5>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Broj računa</th>
                                                    <th>Tip</th>
                                                    <th>Stanje</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.state.racun?.map(ra => (
                                                    <tr>
                                                        <td>{ra.br_racuna}</td>
                                                        <td>{ra.tip}</td>
                                                        <td>{ra.racun_valuta[0].stanje}</td>
                                                    </tr>
                                                ))     
                                            }
                                            </tbody>
                                        </Table>
                                    </>}
                                <Button onClick={() => {this.changeState()}}  variant="primary">Otvori račun</Button>
                                {
                                    this.state.isZavrseno ? (
                                   <> 
                                        <Link className="zatvori" to={"/sluzbenikPocetna"}>
                                            <Button variant="danger">Zatvori</Button>
                                        </Link>
                                    </>      
                            
                                ): ""
                            }
                            </Card.Body>
                    </>
                        ):
                    (
                        this.state.tip === undefined ? (
                    <>
                        <Card.Header as="h5">OTVARANJE RAČUNA</Card.Header>
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
                                        onChange={e => {this.uzmiPodatke(e)}} />

                                    <Form.Check
                                        value={"devizni"}
                                        type={"radio"}
                                        label={"Devizni račun"}
                                        id={"prodaja"}
                                        name="tip" 
                                        onChange={e => {this.uzmiPodatke(e)}}/>
                                </div>
                            </Form>
                        </Card.Body></>
                    ):
                    
                    (
                        !this.state.isIzabraneValute ?  (
                <>
                    <>
                        <Card.Header as="h5">OTVARANJE RAČUNA</Card.Header>
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
                                                v.sifra !== "rsd" ? (
                                                <Form.Check
                                                    value={v.valuta_id}
                                                    type={"checkbox"}
                                                    label={v.sifra}
                                                    id={""}
                                                    name="valuteId" 
                                                    onChange={e => {this.uzmiCheckbox(e)}}
                                                />
                                            ) : ""
                                        ))
                                    )}
                                    <Button onClick={() => {this.promeniStanje()}}  className="dugme" size="sm" variant="primary">
                                        Potvrdi
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body></>
                    </>                    
                            
                        ): 
                            <>
                                         
                            {
                                !this.state.isOtvoren ? (
                        <>
                            <Card.Header as={"h5"}>OTVARANJE RAČUNA</Card.Header>
                            <Card.Body>
                                <Card.Title>Svrha otvaranja računa</Card.Title>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Control name="svrha" onChange={e => {this.uzmiPodatke(e)}} type="text" placeholder="Unesite svrhu otvaranja računa" />
                                    </Form.Group>
                                </Form> 
                                <Button disabled = {this.state.isUProcesu} onClick={() => {this.posaljiPodatke()}} className="dugme" size="sm" variant="primary">
                                    <Spinner 
                                        as="span"
                                        animation="grow"
                                        size="sm"
                                        role="status"
                                        hidden = {!this.state.isUProcesu}
                                    />
                                    {
                                    !this.state.isUProcesu ? (
                                        "Otvori račun"
                                    ):
                                        "Molimo sačekajte"
                                    }
                            </Button>
                            </Card.Body></>
                    
                            ): 
                            <>
                                <Card.Header as={"h5"}>USPEŠNO OTVOREN RAČUN</Card.Header>
                                <Card.Body>
                                    <Card.Title>Sada možete da odštampate ugovor za {this.state.tip} račun</Card.Title>
                                    <ReactToPrint 
                                        trigger={() => <Button variant="link">Odštampaj ugovor</Button>}
                                        content={() => this.componentRef}
                                    />
                                <div hidden>
                                    <UgovorComponent ime={this.state.korisnik?.ime} prezime={this.state.korisnik?.prezime} jmbg={this.state.korisnik?.jmbg} 
                                        brLk={this.state.korisnik?.br_licne_karte} brRacuna={this.state.brRacuna} tip={this.state.tip}
                                        ref={el => (this.componentRef = el)}/>
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
                                    <Button disabled = {this.state.isUProcesu} onClick={() => {this.posaljiIsPotpisao()}} className="dugme" size="sm" variant="primary">
                                        <Spinner 
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            hidden = {!this.state.isUProcesu}
                                        />
                                        {
                                            !this.state.isUProcesu ? (
                                                "Završi"
                                            ):
                                                "Molimo sačekajte"
                                        }
                                    </Button>
                                </Form>
                            </Card.Body></>
                            }
                    </>
                    )
                    )                                       
                    }
                </Card>
            </Container>
        )
    }

    private changeState() {
        this.setState({
            isOtvaranjeRacuna: true
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
            isIzabraneValute: true
        })
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    private posaljiPodatke() {
        this.setState({
            isUProcesu: true
        })

        RacunService.addRacun({
            tip: this.state.tip,
            valuta: this.state.valuteId,
            svrha: this.state.svrha
        })
        .then(res => {
            if(res.success) {
                this.setState({
                    isOtvoren: true,
                    tip: res.racun.tip,
                    brRacuna: res.racun.brRacuna,
                    racunId: res.racun.racunId,
                    isUProcesu: false

                })
                
               addAktivnost(window.location.href, "Službenik dodao račun za novog korisnika.", "sluzbenik");                 
            }
        })
    } 
    
    private posaljiIsPotpisao() {
        this.setState({
            isUProcesu: true
        })

        if(this.state.isPotpisao === "true") {
            RacunService.editIsAktivan(
                {
                    racunId: this.state.racunId,
                }
            )
            .then(res => {
                console.log(res);
                if(res.success) {
                    console.log("heeeej ovde sam.")
                    this.getRacun();
                
                    this.setState({
                        isOtvaranjeRacuna: false,
                        isZavrseno: true,
                        isOtvoren: false,
                        isIzabraneValute: false,
                        tip: undefined,
                        isUProcesu: false
                    })

                }
            })
        } else {
            RacunService.obrisiNijePotpisao({
                racunId: this.state.racunId
            })
            .then(res => {
                if(res.success) {
                    this.setState({
                        isOtvaranjeRacuna: false,
                        isZavrseno: true,
                        isOtvoren: false,
                        isIzabraneValute: false,
                        tip: undefined,
                        isUProcesu: false
                    })    
                }
            })    
        }
    }
}