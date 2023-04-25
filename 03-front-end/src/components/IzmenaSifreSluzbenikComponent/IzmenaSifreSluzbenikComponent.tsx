import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import BasePage from "../BasePage/BasePage";
import NaslovComponent from "../NaslovComponent/NaslovComponent";
import SluzbenikService from '../../services/SluzbenikService';

class IzmenaSifreSluzbenikComponentState {
    staraSifra: string;
    novaSifra: string;
    ponovoNovaSifra: string;
    poruka: string;
    uspesno: string;
    isUProcesu: boolean;
}

export default class IzmenaSifreSluzbenikComponent extends BasePage<{}> {
    state: IzmenaSifreSluzbenikComponentState;

    constructor(props: any) {
        super(props)

        this.state = {
            staraSifra: "",
            novaSifra: "",
            ponovoNovaSifra: "",
            poruka: "",
            uspesno: "",
            isUProcesu: false
        }
    }

    renderMain(): JSX.Element {
        return (
            <Container className="forma">
                <NaslovComponent poruka="Izmena šifre" />
               {
                    this.state.poruka !== ""  ? (
                <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                {
                    this.state.uspesno !== "" ? (
                <Alert className="alert" key={"success"} variant={"success"}>{this.state.uspesno}</Alert>
                ): ""}
                <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Stara šifra</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="staraSifra" placeholder="Unesite staru šifru" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Nova šifra</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="novaSifra" placeholder="Unesite novu šifru" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >Ponovo unesite novu šifru</Form.Label>
                    <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="password" name="ponovoNovaSifra" placeholder="Ponovo unesite novu šifru" />
                </Form.Group>
                </Form>
                <Button disabled = {this.state.isUProcesu} onClick={() => {this.posaljiPodatke()}}  variant="primary">
                <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isUProcesu}
                        />
                        {
                        !this.state.isUProcesu? (
                            "Promenite šifru"
                        ) :
                            "Molimo sačekajte"
                        }
                    
                </Button>
          </Container>  
        )
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

        if(this.state.staraSifra !== "" && this.state.novaSifra !== "" && this.state.ponovoNovaSifra !== "") {
            if(this.state.novaSifra === this.state.ponovoNovaSifra){
                SluzbenikService.editSifra({
                    password_hash_old: this.state.staraSifra,
                    password_hash: this.state.novaSifra,
                    password_hash_ponovo: this.state.ponovoNovaSifra
                })
                .then(res => {
                    if(!res.success) {
                        this.setState({
                            poruka: res.message
                        })
                    } else {
                        this.setState({
                            uspesno: "Uspešno ste promenili šifru.",
                            isUProcesu: false,
                            poruka: ""
                        })
                    }
                })
            } else {
                this.setState({
                    poruka: "Šifre se ne poklapaju.",
                    isUProcesu: false
                })
            }    
        } else {
            this.setState({
                poruka: "Morate popuniti sva polja.",
                isUProcesu: false
            })
        } 
    }
}