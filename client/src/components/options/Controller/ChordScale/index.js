import React, {Component} from 'react';

import SearchHeader from '../../header/search';
import NavSearchHeader from '../../header/navsearch';
import SelectedObjectHeader from '../../header/selectedObject';
import EditHeader from '../../header/edit';
import Footer from '../../footer/index';
import SelectedObject from '../../selectedObject/index';
import NoteNav from '../../noteNav/index';
import ListArea from '../../listArea/index';
import Toggle from '../../toggle/index';
import VisualInstrument from '../../../../scenes/visualizer/index';
import ChordTypeRadio from '../../radio/ChordType';
import ScaleTypeRadio from '../../radio/ScaleType';
import EditChordRadio from '../../radio/EditChord';
import EditScaleRadio from '../../radio/EditScale';

class ChordScaleController extends Component{

    constructor(props) {
        super(props);
        this.getPlaceholder = this.getPlaceholder.bind(this);
        this.getTextSearchViewContents = this.getTextSearchViewContents.bind(this);
        this.getSelectedViewContents = this.getSelectedViewContents.bind(this);
        this.getNavSearchViewContents = this.getNavSearchViewContents.bind(this);
        this.getNavSearchModeContents = this.getNavSearchModeContents.bind(this);
        this.getEditViewContents = this.getEditViewContents.bind(this);
        this.state = {searchGets: null};
    }

    async componentDidUpdate(prevProps){
        console.log("componentDidUpdate");
        console.log(this.props.searchInputValue);
        console.log(prevProps.searchInputValue);
        console.log(this.props.view);
        if( this.props.view === "search" &&this.props.searchInputValue !== prevProps.searchInputValue){
            let chord = await this.props.search.text.get(this.props.searchInputValue);
            console.log(chord);
            this.setState((state,props) => {
                return {searchGets: [{
                    label: chord.name,
                    object: chord
                }]};
            });
        }
    }

    getPlaceholder() {
        switch(this.props.type) {
            case "chord":
                return "C7, E, Am, etc";
                break;
            case "scale":
                return "C Major, E Lydian, etc";
                break;
            default:
                throw TypeError("props.type is not 'scale' or 'chord'");
        }
    }

    getTextSearchViewContents() {
        const headerText = this.props.search.text.input;
        const onTextChange = this.props.search.text.onChange;
        const toNavView = this.props.viewSwitch.toNav;

        let header;
        let listArea;
        let visualInstrument;
        let toggle;
        let footer;

        header = <SearchHeader textValue={headerText} onChange={onTextChange} placeholder={this.getPlaceholder()} toNavView={toNavView} />;
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;

        if (this.props.search.gets) {
            const listItemClick = this.props.search.text.onItemClick;
            listArea = <ListArea handleItemClick={listItemClick} list={this.props.search.gets} title={this.props.type === "chord" ? "Chords" : "Scales"} />
        }

        if (this.props.toggle.isRequired) {
            const title = this.props.type === "chord" ? "Match Scale" : "Match Chord";
            toggle = <Toggle handleClick={this.props.toggle.onClick} checked={this.props.toggle.value} title={title} />;
        }

        footer = <Footer onUpdate={this.props.footer.onUpdate} selectedValue={this.props.footer.selectedValue} />;

        return <>
            <div class="top-controls">
                {header}
                {listArea}
            </div>
            {visualInstrument}
            <div class="bottom-controls">
                {toggle}
                {footer}
            </div>
        </>
    }

    getSelectedViewContents() {
        let header;
        let selectedObject;
        let visualInstrument;
        let footer;

        header = <SelectedObjectHeader toNavView={this.props.viewSwitch.toNav} toSearchView={this.props.viewSwitch.toSearch} /> ;
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;  

        const toEdit = this.props.viewSwitch.toEdit;
        const onDeselect = this.props.selection.onDeselect;
        const label = this.props.selection.primary.name;
        selectedObject = <SelectedObject onEditRequest={toEdit} onDeselect={onDeselect} label={label}/>;

        footer = <Footer onUpdate={this.props.footer.onUpdate} selectedValue={this.props.footer.selectedValue} />;

        return <>
            <div class="top-controls">
                {header}
                {selectedObject}
            </div>
            {visualInstrument}
            <div class="bottom-controls">
                {footer}
            </div>
        </>
    }

    getNavSearchViewContents() {
        if (this.props.type !== "chord" && this.props.type !== "scale") {throw new Error("navsearch must be chord or scale")};

        let header;
        let noteNav;
        let listArea;
        let visualInstrument;
        let radio;
        let toggle;
        let footer;

        //this.props.getChords(this.props.noteSelect.value, this.props.radio.nav, limitByOther);
        header = <NavSearchHeader toSearchView={this.props.viewSwitch.toSearch} focus={this.props.type}/>
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;

        const noteNavValue = this.props.search.noteSelect.note.value;
        const noteNavLabel = this.props.search.noteSelect.note.label;
        const outsideClick = this.props.search.noteSelect.handleClickOutside;
        const onNoteUpdate = this.props.search.noteSelect.onUpdate;
        const customSelectClick = this.props.search.noteSelect.handleCustomClick;
        const customListIsOpen = this.props.search.noteSelect.customListIsOpen;
        noteNav = <NoteNav value={noteNavValue} label={noteNavLabel} handleClickOutside={outsideClick} onNoteUpdate={onNoteUpdate} handleCustomSelectClick={customSelectClick} customListIsOpen={customListIsOpen} name={this.props.type} />;
        
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;

        const radioValue = this.props.radio.nav;
        const onUpdate = this.props.radio.onUpdate;
        radio = this.props.type === "chord" ? <ChordTypeRadio selectedValue={radioValue} onUpdate={onUpdate} /> : <ScaleTypeRadio selectedValue={radioValue} onUpdate={onUpdate}/>;

        if (this.props.toggle.isRequired) {
            const title = this.props.type === "chord" ? "Match Scale" : "Match Chord";
            toggle = <Toggle handleClick={this.props.toggle.onClick} checked={this.props.toggle.value} title={title} />;
        }

        footer = <Footer onUpdate={this.props.footer.onUpdate} selectedValue={this.props.footer.selectedValue} />;


        if (this.props.type === "chord") {
            const list = this.props.search.navChordList;
            const listItemClick =this.props.search.nav.onItemClick;
            listArea = <ListArea title={this.props.radio.nav || "Triad"}  handleItemClick={listItemClick} list={list} />;
        } else if (this.props.type === "scale") {
            // need to make it a mode list that links to other lists
            const list = this.props.modes.get(this.props.search.noteSelect.note.value, this.props.radio.nav, this.props.search.limitByOther);
            const itemClick = this.props.search.nav.onScaleItemClick;
            listArea = <ListArea title={"Scale Groups"} handleItemClick={itemClick} list={list} />;
        }

        return <>
            <div class="top-controls">
                {header}
                {noteNav}
                {listArea}
            </div>
            {visualInstrument}
            <div class="bottom-controls">
                {radio}
                {toggle}
                {footer}
            </div>
        </>
    }

    getNavSearchModeContents() {
        if (this.props.type === "chord") {throw new TypeError("props.type 'chord' has no 'navsearchmode'");}

        let header;
        let noteNav;
        let listArea;
        let visualInstrument;
        let footer;

        header = <NavSearchHeader toSearchView={this.props.viewSwitch.toSearch} focus={this.props.type}/>;

        const noteNavValue = this.props.search.noteSelect.note.value;
        const noteNavLabel = this.props.search.noteSelect.note.label;
        const outsideClick = this.props.search.noteSelect.handleClickOutside;
        const onNoteUpdate = this.props.search.noteSelect.onUpdate;
        const customSelectClick = this.props.search.noteSelect.handleCustomClick;
        const customListIsOpen = this.props.search.noteSelect.customListIsOpen;
        noteNav = <NoteNav value={noteNavValue} label={noteNavLabel} handleClickOutside={outsideClick} onNoteUpdate={onNoteUpdate} handleCustomSelectClick={customSelectClick} customListIsOpen={customListIsOpen} name={this.props.type} />;
        
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;

        const list = this.props.modes.getScalesFromModeName(this.props.search.noteSelect.note.value, this.props.nav.mode, this.props.search.limitByOther);
        const itemClick = this.props.search.nav.onItemClick;
        listArea = <ListArea title={this.props.nav.mode + " Modes"} handleItemClick={itemClick} list={list} />;

        footer = <Footer onUpdate={this.props.footer.onUpdate} selectedValue={this.props.footer.selectedValue} />;

        return <>
            <div class="top-controls">
                {header}
                {noteNav}
                {listArea}
            </div>
            {visualInstrument}
            <div class="bottom-controls">
                {footer}
            </div>
        </>
    }

    getEditViewContents() {
        if (!this.props.selection) {throw new TypeError(this.props.view + " requires this.props.selection (" + this.props.type + ")");}
        if (this.props.type !== "chord" && this.props.type !== "scale") {throw new Error("edit must be chord or scale")};

        let header;
        let visualInstrument;
        let listArea;
        let radio;
        let footer;

        header = <EditHeader />
        visualInstrument = <VisualInstrument instrument={this.props.visualizer.instrument} selectedNotes={this.props.visualizer.selectedNotes}/>;
        radio = this.props.type === "chord" ? <EditChordRadio selectedValue={this.props.radio.edit} onUpdate={this.props.radio.onUpdate}/> :<EditScaleRadio selectedValue={this.props.radio.edit} onUpdate={this.props.radio.onUpdate}/>;

        if (this.props.type === "chord") {

            const title = this.props.radio.edit;
            const itemClick = this.props.search.nav.onItemClick;
            const list = this.props.selection.getNearbys(this.props.selection.primary,this.props.radio.edit);
            listArea = <ListArea title={ title || "Extensions"} handleItemClick={itemClick} list={list} />;

        }else if (this.props.type === "scale") {

            const title = this.props.radio.edit;
            const itemClick = this.props.search.nav.onModeItemClick;
            const list = this.props.selection.getNearbys(this.props.selection.primary, this.props.radio.edit);
            listArea = <ListArea title={ title || "Alterations"} handleItemClick={itemClick} list={list} />;

        }

        footer = <Footer onUpdate={this.props.footer.onUpdate} selectedValue={this.props.footer.selectedValue} />;

        return <>
            <div class="top-controls">
                {header}
                {listArea}
            </div>
            {visualInstrument}
            <div class="bottom-controls">
                {radio}
                {footer}
            </div>
        </>
    }


    render() {
        let contents;

        switch(this.props.view) {
            case "selected":
                // if theres no primary selection, 'selected' force user to get the TextSearch View in order to find one
                contents = this.props.selection.primary ? this.getSelectedViewContents() : this.getTextSearchViewContents();
                break;
            case "search":
                contents = this.getTextSearchViewContents();
                break;
            case "navsearch":
                contents = this.getNavSearchViewContents();      
                break;
            case "navsearchmode":
                contents = this.getNavSearchModeContents();
                break;   
            case "edit":
                contents = this.getEditViewContents();
                break;
            default:
                throw new TypeError("this.props.view (" + this.props.view +  " ) is not valid");
        }
        return <>
            {contents}
        </>
    }
}


ChordScaleController.toggleIsVisible = function toggleIsVisible(view, focus, selection) {
    //if view is 'selected' but we have no selection.primary (acts like a textsearch which has a toggle IF there is a selection.secondary, so true)
    //if selection.secondary and we are in navsearch, give player the toggle
    // if selection.secondary and we are in textsearch, give player the toggle

    const selectedViewWithSecondaryButNoPrimarySelection = (view[focus] === "selected" && !selection.primary && selection.secondary);
    const navsearchViewWithSecondarySelection = (view[focus] === "navsearch" && selection.secondary);
    const textSearchViewWithSecondarySelection = (view[focus] === "search" && selection.secondary);

    return ( selectedViewWithSecondaryButNoPrimarySelection || navsearchViewWithSecondarySelection || textSearchViewWithSecondarySelection);
}

ChordScaleController.notenavIsVisible = function notenavIsVisible(view, focus) {
    return (view[focus] === "navsearch" || view[focus] === "navsearchmode");
}

ChordScaleController.radioIsVisible = function radioIsVisible(view, focus) {
    return (view[focus] === "navsearch" || view[focus] === "edit" );
}

ChordScaleController.listIsVisible = function listIsVisible(view, focus, navSearchGets, textSearchGets, selection) {
    if (view[focus] === "selected" && !selection.primary && textSearchGets) {return true;}
    if (view[focus] === "search" && textSearchGets) {return true;}

    if (view[focus] === "navsearch" || view[focus] === "navsearchmode" || view[focus] === "edit") {
        return navSearchGets;
    }

    return false;
}



export default ChordScaleController;
