import BasePage, { BasePageProperties } from "../BasePage/BasePage";

class PriznanicaComponentProperties extends BasePageProperties {
    brRacuna: string;
    jmbg: string
    ime: string | undefined;
    prezime: string | undefined;
    brLk: string | undefined;
    iznos: number;
    valuta: string
}


class PriznanicaComponentState {
    brRacuna: string;
    jmbg: string;
    ime: string;
    prezime: string;
    brLk: string;
    iznos: number;
    valuta: string;
}


export default class PriznanicaComponent extends BasePage<PriznanicaComponentProperties> {
    state: PriznanicaComponentState;
        
    constructor(props: any) {
        super(props);
        
        this.state = {
            brRacuna: "",
            jmbg: "",
            ime: "",
            prezime: "",
            brLk: "",
            iznos: 0,
            valuta: ""
        }
    } 
    
    private setData() {
                
        this.setState({
            brRacuna: this.props.brRacuna,
            jmbg: this.props.jmbg,
            ime: this.props.ime,
            prezime: this.props.prezime,
            brLk: this.props.brLk,
            iznos: this.props.iznos,
            valuta: this.props.valuta
        })
             
    }

    componentDidMount() {
        this.setData();
    }

    renderMain(): JSX.Element {
        return (
           <div>
                <h1>Priznanica</h1>
                <p>Ime i prezime korisnika: {this.state.ime} {this.state.prezime}</p>
                <p>JMBG korisnika: {this.state.jmbg}</p>
                <p>Broj lične karte: {this.state.brLk}</p>
                <p>Broj računa: {this.state.brRacuna}</p>
                <p>Iznos: {this.state.iznos} <b>{this.state.valuta.toLocaleUpperCase()}</b></p>
                <p>Potpis korisnika</p>
                <p>_________________________</p>
           </div>
        )
    }
    
}    