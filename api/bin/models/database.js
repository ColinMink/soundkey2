const chordExp = require('chord-expressions');
const Chord = require('chord-expressions').Chord;
const Scale = require('chord-expressions').Scale;
const Note = require('chord-expressions').Note;
const Settings = require("../../settings");
const mysql = require('mysql2');
const dbSettings = Settings[Settings.env].db;


const pool = mysql.createPool({
    host: dbSettings.host,
    user:dbSettings.user,
    password: dbSettings.password,
    database: 'sound_key',
    port: dbSettings.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); 

pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
    console.log('setting SQL mode');
    console.log(connection.modes);
    connection.query('SET sql_mode=only_full_group_by');
});

async function fetchSQL(sql){
    return new Promise((resolve, reject) => {
        pool.query(sql, function (error, results, fields) {
            if (error) {
                console.log("FetchSQL error: " + error);
                reject(error);
            };
            resolve(results);
        });
    });
}

async function fetchPreparedStatement(sql, params){

    console.log("!!!! going to fetch prepared statment");
    console.log(pool);
    return new Promise((resolve, reject) => {
        pool.execute(sql, params, function (error, results) {
            if (error) {
                console.log("FetchPreparedStatement error: " + error);
                reject(error);
            };
            resolve(results);
        });
    });
}



function formatLookupInput(obj){
    let notes;
    
    try{
        notes = obj.notes ? obj.notes.map(ele => {return ele.name}) : obj;
        validateNotesInput(notes);
        return notes;
    } catch(err) {
        throw("Invalid Notes input");
    }
}

function validateNotesInput(obj){
    if(obj === null){
        return;
    }
    let notes = obj.notes ? obj.notes : obj;
    notes = Array.isArray(notes) ? notes : [notes];
    let flag = false;
    const noteNames = [
        "A",
        "A#",
        "B",
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#"
    ];
    //console.log("notes");
    //console.log(notes);
    notes.forEach(note =>{
        if(noteNames.findIndex(name => name === note) === -1){
            console.log("Invalid Note: " + note);
            throw("Invalid Note: " + note);
        }
    });
    return;
}
const modes = [
    "diatonic",
    "melodic minor",
    "neapolitan major",
    "neapolitan minor",
    "harmonic minor",
    "harmonic major",
    "double harmonic",
    "hungarian major",
    "harmonic lydian"
];

function validateModeInput(mode){
    if(mode === null){
        return;
    }
    if(modes.find(element => element === mode) === undefined){
        console.log("Invalid Mode: ", mode);
        throw("Invalid Mode: ", mode);
    }
}

function validateCategoryInput(category){
    const categories = [
        "Triad",
        "Seven",
        "Nine",
        "Eleven",
        "Thirteen",
        "Six"
    ];
    if (category === null){
        return
    } else if(!category.includes(category)){
        console.log("Invalid Chord category: ", category);
        throw("Invalid Chord category: ", category);
    }
}



//ARG is a chord or notes array
// RETURN should be an array of chords that have ALL notes the chord does plus any extras
// USE user can see chords with added tones
async function getChords(scaleToLimitBy, root = null, category = null) {
    console.log("inside db.getChords");
    console.log(scaleToLimitBy);
    console.log("scaleToLimitBy^");


    validateNotesInput(root);
    validateCategoryInput(category);

    let sql = `SELECT
        c.name,
        c.symbol,
        c.root_note,
        c.category,
        JSON_ARRAYAGG(cn.note) AS notes,
        c.triad_base as triad_base
    FROM
        chords c
    INNER JOIN chord_has_note cn
        ON c.symbol = cn.chord_symbol
        AND c.root_note = cn.root_note
    WHERE
        c.root_note = ? AND c.category = ?
    GROUP BY
        c.name, c.symbol, c.root_note, triad_base
    -- Only select chords that contain notes from the allowed list 
    `;


    let params;

    if (scaleToLimitBy) { 
        const notesLimiter = formatLookupInput(scaleToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `HAVING COUNT(CASE WHEN cn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT cn.note),?) -- matches all notes in chord if match toggle, which may not be`;
        sql += constrainerStr; 
 
        params = [root, category, ...notesLimiter, notesLimiter.length];
    } else {
        params = [root, category];
    }

    console.log(sql);
    console.log('Parameters:', params);

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }

    

    let results = [];
    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;

        results.push(chord);
    });
    console.log(results);
    return results;
}

function validateGroupID(id) {
    if (!Number.isInteger(id)) {throw new Error ("groupID must be an integer");}
}


async function getScales(chordToLimitBy, root, groupID) { 
    console.log("inside database.js getScales");

    validateNotesInput(root);
    validateGroupID(groupID);

    let sql = `
    SELECT
        scale.name,
        scale.root_note,
        scale.group_id,
        scale_groups.name AS group_name,
        GROUP_CONCAT(sn.note ORDER BY
            CASE
            WHEN sn.note >= ? THEN 1 -- Root Note alphabetical order starting on root note from navnote selection
                ELSE 2
            END,
            sn.note ASC) AS notes
    FROM
        scales scale
    INNER JOIN scale_has_note sn
            ON scale.name = sn.scale_name
            AND scale.root_note = sn.root_note
    INNER JOIN scale_groups                     -- gsf
        ON scale.group_id = scale_groups.id
    WHERE
            scale.root_note = ? AND scale.group_id = ? -- root comes from navnote selection, group_id comes from state.scaleGroupSelection
    GROUP BY
        scale.name, scale.root_note, scale_groups.name
    `;

    let params;

    if (chordToLimitBy) { 
        const notesLimiter = formatLookupInput(chordToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `HAVING COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) -- matches all notes in chord if match toggle, which may not be`;
        sql += constrainerStr; 
        params = [root, root, groupID, ...notesLimiter, notesLimiter.length];
    } else {
        params = [root, root, groupID];
    }

    console.log(sql);
    console.log('Parameters:', params);

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }



    let results = [];
    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
            console.log("RUH ROH RAGGY");
            throw err;
        }
    });
    return results;
}

// for helping the chord.fromNotation along
async function getChordCategoryAndTriadBase(rootNoteStr, noteStrList) {
    const notesPlaceholders = noteStrList.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol,
        chn.root_note,
        chord.name as name,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    WHERE 
        chord.root_note = ?
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        name,
        category,
        triad_base
    HAVING 
        COUNT(*) = ?  -- number of notes in the target chords
        AND SUM(CASE WHEN chn.note IN (${notesPlaceholders}) THEN 1 ELSE 0 END) = ?
        `;


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, [rootNoteStr,noteStrList.length,...noteStrList,noteStrList.length]);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }

        let results = [];

    qResults.forEach(ele => {
       results.push({category: ele.category || "Crafted", triadBase: ele.triad_base || null});
    });
    return results[0] || {category: "Crafted", triadBase: null};
}


//should noteValue just be a note instead? it would prevent a lookup that we could do on the client instead
//obj is either an array of notes or a chord/scale object
async function getScaleGroups(chordToLimitBy, root, type){
    const typeLookupTable = {
        "Pentatonic": 5,
        "Hexatonic":  6,
        "Heptatonic": 7,
        "Octatonic":  8,
        "Dodecatonic": 12,
    };

    validateNotesInput(root);

    const SCALE_LENGTH = typeLookupTable[type];
    if (!SCALE_LENGTH) {throw new Error("Invalid SCALE_LENGTH");}

    let sql = `
        SELECT 
            DISTINCT(scale.group_id) as id,
            sg.name AS name 
        FROM 
            scales scale
        JOIN scale_has_note sn
            ON scale.name = sn.scale_name
            AND scale.root_note = sn.root_note
        JOIN scale_groups sg
            ON scale.group_id = sg.id 
        WHERE
            scale.root_note = ? -- root note from note nav selection
        GROUP BY 
            scale.name, scale.root_note
        HAVING 
            COUNT(sn.note) = ? -- note count from radio  
        `;

    let sqlEnd = `ORDER BY 
            scale.group_id ASC;`;

    let params;

    if (chordToLimitBy) { 
        const notesLimiter = formatLookupInput(chordToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) 
                                -- matches all notes in chord if match toggle, which may not be 
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
 
        params = [root, SCALE_LENGTH, ...notesLimiter, notesLimiter.length];
    } else {
        sql += sqlEnd;
        params = [root, SCALE_LENGTH];
    }

    console.log(sql);
    console.log('Parameters:', params);

    let results = [];

    try {
        results = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }


    return results;
}

//ARG is a chord or notes array
// RETURN should be an array of chords that have N-1 amount of matching notes but the same amount of notes. Meaning [C,E,G] might return [[C,F,G], [C,D,G], [C,Eb,G], [D,E,G], etc...]
// USE user can see chord alterations 1 step away
async function getChordExtensions(baseChord, root = null, category = null, scaleToLimitBy, triadBase) {
    console.log("inside DATABASE.JS getChordExtensions");

    validateNotesInput(root);
    validateCategoryInput(category);
    const baseChordNotes = formatLookupInput(baseChord);

    const categoryCheck = (() => {
        if (!category) {throw Error("cant get an extension if there's no category")} 
        return {
            "Triad": "(chord.category = 'Seven' OR chord.category = 'Six')",
            "Seven": "chord.category = 'Nine'",
            "Nine": "chord.category = 'Eleven'",
            "Eleven": "chord.category = 'Thirteen'",
            "Thirteen": "chord.category = 'ExtensionsForThirteen (None)'"
        }[category] || "chord.category = 'ERROR: invalid chord category in getChordExtensions'";
    })();

    const baseChordNotesPlaceholders = baseChordNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol,
        chn.root_note,
        chord.name as name,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    WHERE 
        chord.root_note = ?
        AND
        ${categoryCheck}
        ${triadBase ? "AND triad_base = ?" : ""}
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        name,
        category,
        triad_base
    HAVING 
        COUNT(*) = ?  -- number of notes in the target chords
        AND SUM(CASE WHEN chn.note IN (${baseChordNotesPlaceholders}) THEN 1 ELSE 0 END) = ?
        `;

    let params;

    if (scaleToLimitBy) { 
        const notesLimiter = formatLookupInput(scaleToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN chn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT chn.note),?) 
                                `;
        sql += constrainerStr; 

        if (triadBase) {
            params = [root, triadBase ,baseChordNotes.length + 1, ...baseChordNotes, baseChordNotes.length, ...notesLimiter, notesLimiter.length];
        } else {
            params = [root, baseChordNotes.length + 1, ...baseChordNotes, baseChordNotes.length, ...notesLimiter, notesLimiter.length];
        }
    
        
    } else {
        if (triadBase) {
            params = [root, triadBase ,baseChordNotes.length + 1, ...baseChordNotes, baseChordNotes.length];
        } else {
            params = [root, baseChordNotes.length + 1, ...baseChordNotes, baseChordNotes.length];
        }
        
    }


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }





    let results = [];


    /* THIS KIND OF CLUNKY */
    

    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.chord_symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;
        
        results.push(chord);
    });

    console.log(sql);
    console.log(params);

    return results;
}
 
//ARG is a chord or notes array
// RETURN should be an array of chords that have N-1 amount of matching notes but the same amount of notes. Meaning [C,E,G] might return [[C,F,G], [C,D,G], [C,Eb,G], [D,E,G], etc...]
// USE user can see chord alterations 1 step away
async function getChordAlterations(baseChord, scaleToLimitBy) {
    console.log("inside getChordAlterations");

    baseChordNotes = formatLookupInput(baseChord);
    const baseChordNotesPlaceholders = baseChordNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol,
        chn.root_note,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        category,
        triad_base
    HAVING 
        COUNT(*) = ?
        AND SUM(CASE WHEN chn.note IN (${baseChordNotesPlaceholders}) THEN 1 ELSE 0 END) = ? 
        `;

    let sqlEnd = `ORDER BY 
        CASE 
            WHEN chn.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of chord being altered
            ELSE 2
        END,
    chn.chord_symbol; -- alphanumerical order`;

    let params;

    if (scaleToLimitBy) { 
        const notesLimiter = formatLookupInput(scaleToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN chn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT chn.note),?) 
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseChordNotes.length,  ...baseChordNotes, baseChordNotes.length - 1, ...notesLimiter, notesLimiter.length, baseChordNotes[0]];
    } else {
        sql += sqlEnd;
        params = [baseChordNotes.length, ...baseChordNotes, baseChordNotes.length - 1, baseChordNotes[0]];
    }

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }





    let results = [];

    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.chord_symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;

        results.push(chord);
    });

    return results;
}

async function getChordAppendments(baseChord, scaleToLimitBy) {
    console.log("inside DATABASE.JS getChordAppendments");

    baseChordNotes = formatLookupInput(baseChord);
    const baseChordNotesPlaceholders = baseChordNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol,
        chn.root_note,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        category,
        triad_base
    HAVING 
        COUNT(*) = ? 
        AND SUM(CASE WHEN chn.note IN (${baseChordNotesPlaceholders}) THEN 1 ELSE 0 END) = ?
        `;
 
    let sqlEnd = `
    ORDER BY 
        CASE 
            WHEN chn.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of chord being altered
            ELSE 2
        END,
    chn.chord_symbol; -- alphanumerical order`;

    let params;

    if (scaleToLimitBy) { 
        const notesLimiter = formatLookupInput(scaleToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN chn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT chn.note),?)
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseChordNotes.length + 1,  ...baseChordNotes, baseChordNotes.length, ...notesLimiter, notesLimiter.length, baseChordNotes[0]];
    } else {
        sql += sqlEnd;
        params = [baseChordNotes.length + 1, ...baseChordNotes, baseChordNotes.length, baseChordNotes[0]];
    }

    console.log(sql);

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }




    let results = [];

    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.chord_symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;

        results.push(chord);
    });
    return results;
}

async function getChordDeductions(baseChord, scaleToLimitBy) {
    console.log("inside DATABASE.JS getChordDeductions");

    baseChordNotes = formatLookupInput(baseChord);
    const baseChordNotesPlaceholders = baseChordNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol,
        chn.root_note,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        category,
        triad_base
    HAVING 
        COUNT(*) = ?  -- number of notes in the target chords
        AND SUM(CASE WHEN chn.note IN (${baseChordNotesPlaceholders}) THEN 1 ELSE 0 END) = ?
        `;

    let sqlEnd = `
    ORDER BY 
        CASE 
            WHEN chn.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of chord being altered
            ELSE 2
        END,
    chn.chord_symbol; -- alphanumerical order`;

    let params;

    if (scaleToLimitBy) { 
        const notesLimiter = formatLookupInput(scaleToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN chn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT chn.note),?)
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseChordNotes.length - 1,  ...baseChordNotes, baseChordNotes.length - 1, ...notesLimiter, notesLimiter.length, baseChordNotes[0]];
    } else {
        sql += sqlEnd;
        params = [baseChordNotes.length - 1, ...baseChordNotes, baseChordNotes.length - 1, baseChordNotes[0]];
    }

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }



    let results = [];

    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.chord_symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;

        results.push(chord);
    });
    return results;
}

async function getChordRotations(root, baseChord) {
    console.log("inside getChordRotations");

    validateNotesInput(root);

    baseChordNotes = formatLookupInput(baseChord);
    const baseChordNotesPlaceholders = baseChordNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        chn.chord_symbol, 
        chn.root_note,
        chord.category as category,
        chord.triad_base as triad_base
    FROM 
        chord_has_note chn 
    JOIN 
        chords chord ON chord.symbol = chn.chord_symbol
    WHERE 
        chn.root_note != ? -- root note of selected chord
    GROUP BY 
        chn.chord_symbol, 
        chn.root_note,
        category,
        triad_base
    HAVING 
        COUNT(*) = ? -- note count of selected chord
        AND COUNT(CASE WHEN chn.note IN (${baseChordNotesPlaceholders}) THEN 1 END) = ?  -- note count of selected chord
    ORDER BY 
        CASE WHEN chn.root_note >= ? THEN 1 -- root note of chord selected
        ELSE 2 END, 
    chn.root_note ASC;
    `;

    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, [root, baseChord.length, ...baseChord, baseChord.length, root]);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }



    let results = [];

    qResults.forEach(ele => {
        const chord = Chord.chordFromNotation(ele.chord_symbol, true);

        // app needs label
        chord.notes = chord.notes.map(note => {
            const { name, ...rest } = note; 
            return { label: name, ...rest }; 
        });

        // trust the category stored in the database, not the one made by Chord.chordFromNotation because [TODO] chordFromNotation needs logic for stuff like 7#9 being seen as a 7, not a 9
        // this behavior is already in createMod and createAdd in Blueprint class
        chord.category = ele.category;
        chord.triadBase = ele.triad_base;

        results.push(chord);
    });
    return results;
}
 
//ARG is a scale or notes array
// RETURN should be an array of scales that have N-1 amount of matching notes but the same amount of notes. Meaning [C,E,G] might return [[C,F,G], [C,D,G], [C,Eb,G], [D,E,G], etc...]
async function getScaleAlterations(baseScale, chordToLimitBy) {
    console.log("inside getScaleAlterations");

    baseScaleNotes = formatLookupInput(baseScale);
    const baseScaleNotesPlaceholders = baseScaleNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        scale.name,
        scale.root_note,
        scale.group_id,
        scale_groups.name AS group_name,
        GROUP_CONCAT(sn.note ORDER BY 
            CASE 
                WHEN sn.note >= scale.root_note THEN 1 -- Order note list based on root of scale
                ELSE 2
            END,
            sn.note ASC
        ) AS notes
    FROM 
        scales scale
    JOIN scale_has_note sn
        ON scale.name = sn.scale_name
        AND scale.root_note = sn.root_note
    INNER JOIN scale_groups
        ON scale.group_id = scale_groups.id
    GROUP BY 
        scale.name, scale.root_note,  scale_groups.name
    HAVING 
        COUNT(sn.note) = ? -- note count of the scale we are altering
        AND COUNT(CASE WHEN sn.note IN (${baseScaleNotesPlaceholders}) THEN 1 END) = ?
    `;

    let sqlEnd = `
    ORDER BY 
        CASE 
            WHEN scale.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of scale being altered
            ELSE 2
        END,
    scale.root_note ASC
    `;

    console.log("WE JUST BUILT SQWL");

    let params;

    if (chordToLimitBy) { 
        const notesLimiter = formatLookupInput(chordToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) 
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseScaleNotes.length,  ...baseScaleNotes, baseScaleNotes.length - 1, ...notesLimiter, notesLimiter.length, baseScaleNotes[0]];
    } else {
        sql += sqlEnd;
        params = [baseScaleNotes.length, ...baseScaleNotes, baseScaleNotes.length - 1, baseScaleNotes[0]];
    }


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }


    let results = [];

    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
            console.log(err);
        }
    });

    console.log("about to return");
    return results;
}

async function getScaleAppendments(baseScale, chordToLimitBy) {
    console.log("inside getScaleAppendments");

    baseScaleNotes = formatLookupInput(baseScale);
    const baseScaleNotesPlaceholders = baseScaleNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        scale.name,
        scale.root_note,
        scale.group_id,
        scale_groups.name AS group_name,
        GROUP_CONCAT(sn.note ORDER BY 
            CASE 
                WHEN sn.note >= scale.root_note THEN 1 -- Order note list based on root of scale
                ELSE 2
            END,
            sn.note ASC
        ) AS notes
    FROM 
        scales scale
    JOIN scale_has_note sn
        ON scale.name = sn.scale_name
        AND scale.root_note = sn.root_note
    INNER JOIN scale_groups
        ON scale.group_id = scale_groups.id
    GROUP BY 
        scale.name, scale.root_note, scale_groups.name
    HAVING 
        COUNT(sn.note) = ? -- (the count of scale we are altering) plus 1
        AND COUNT(CASE WHEN sn.note IN (${baseScaleNotesPlaceholders}) THEN 1 END) = ? -- Number of matching notes in source scale (all (scale.notes.length)of them)
       `;

    let sqlEnd = `ORDER BY 
        CASE 
            WHEN scale.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of scale being altered
            ELSE 2
        END,
    scale.root_note ASC;`

    let params;

    if (chordToLimitBy) { 
        const notesLimiter = formatLookupInput(chordToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) 
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseScaleNotes.length + 1,  ...baseScaleNotes, baseScaleNotes.length, ...notesLimiter, notesLimiter.length, baseScaleNotes[0]];
    } else {
        sql += sqlEnd;
        console.log(sql);
        console.log([baseScaleNotes.length + 1, ...baseScaleNotes, baseScaleNotes.length, baseScaleNotes[0]]);
        params = [baseScaleNotes.length + 1, ...baseScaleNotes, baseScaleNotes.length, baseScaleNotes[0]];
    }


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }




    let results = [];

    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
        }
    });
    return results;
}

async function getScaleDeductions(baseScale, chordToLimitBy) {
    console.log("inside getScaleDeductions");

    baseScaleNotes = formatLookupInput(baseScale);
    const baseScaleNotesPlaceholders = baseScaleNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        scale.name,
        scale.root_note,
        scale.group_id,
        scale_groups.name AS group_name, 
        GROUP_CONCAT(sn.note ORDER BY 
            CASE 
                WHEN sn.note >= scale.root_note THEN 1 -- Order note list based on root of scale
                ELSE 2
            END,
            sn.note ASC
        ) AS notes
    FROM 
        scales scale
    JOIN scale_has_note sn
        ON scale.name = sn.scale_name
        AND scale.root_note = sn.root_note
    INNER JOIN scale_groups
        ON scale.group_id = scale_groups.id
    GROUP BY 
        scale.name, scale.root_note, scale_groups.name
    HAVING 
        COUNT(sn.note) = ? -- note count of the scale we are altering minus 1
        AND COUNT(CASE WHEN sn.note IN (${baseScaleNotesPlaceholders}) THEN 1 END) = ? -- Number of matching notes in source scale (all (scale.notes.length-1)of them)
        `;

    let sqlEnd = `
    ORDER BY 
        CASE 
            WHEN scale.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of scale being altered
            ELSE 2
        END,
    scale.root_note ASC;`

    let params;

    if (chordToLimitBy) { 
        const notesLimiter = formatLookupInput(chordToLimitBy);
        const placeholders = notesLimiter.map(() => '?').join(', ');
        const constrainerStr = `AND COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) 
                                `;
        sql += constrainerStr; 
        sql += sqlEnd;
    
        params = [baseScaleNotes.length - 1,  ...baseScaleNotes, baseScaleNotes.length -1, ...notesLimiter, notesLimiter.length, baseScaleNotes[0]];
    } else {
        sql += sqlEnd;
        params = [baseScaleNotes.length - 1, ...baseScaleNotes, baseScaleNotes.length - 1, baseScaleNotes[0]];
    }


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }


    let results = [];

    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
        }
    });
    return results;
}

async function getScaleRotations(root, baseScale) {
    console.log("inside getScaleRotations");

    validateNotesInput(root);

    baseScaleNotes = formatLookupInput(baseScale);
    const baseScaleNotesPlaceholders = baseScaleNotes.map(() => '?').join(', ');

    let sql = `
    SELECT 
        s.name, 
        s.root_note, 
        s.group_id,
        scale_groups.name AS group_name,
        GROUP_CONCAT(
            sn.note 
            ORDER BY 
            CASE WHEN sn.note >= s.root_note THEN 1 -- Order note list based on root of scale
            ELSE 2 END, 
            sn.note ASC
        ) AS notes 
    FROM 
        scales s 
        INNER JOIN scale_has_note sn ON s.name = sn.scale_name 
        AND s.root_note = sn.root_note 
    INNER JOIN scale_groups
        ON s.group_id = scale_groups.id
    WHERE 
        s.root_note != ? -- root of the selected scale
    GROUP BY 
        s.name, 
        s.root_note,
        scale_groups.name
    HAVING 
        COUNT(*) = ? -- note count of selected scale
        AND COUNT(CASE WHEN sn.note IN (${baseScaleNotesPlaceholders}) THEN 1 END) = ? -- note count of selected scale
    ORDER BY 
        CASE WHEN s.root_note >= ? THEN 1 -- root note of scale selected
        ELSE 2 END, 
    s.root_note ASC;
    `;


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, [root, baseScaleNotes.length, ...baseScaleNotes, baseScaleNotes.length, root]);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }




    let results = [];

    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
        }
    });
    return results;
}



async function getScalesFromUserString(chordToLimitBy, userSelectedScaleNotes, userString) {
    console.log("inside getScalesFromUserString");

    const baseScaleNotes = userSelectedScaleNotes ? formatLookupInput(userSelectedScaleNotes) : null;

    let sql = `
    SELECT 
        scale.name,
        scale.root_note,
        scale.group_id,
        scale_groups.name AS group_name,
        GROUP_CONCAT(sn.note ORDER BY 
            CASE 
                WHEN sn.note >= scale.root_note THEN 1 -- Order note list based on root of scale
                ELSE 2
            END,
            sn.note ASC
        ) AS notes,
        CONCAT(scale.root_note, ' ', scale.name) AS full_name
    FROM 
        scales scale
    JOIN scale_has_note sn
        ON scale.name = sn.scale_name
        AND scale.root_note = sn.root_note
    INNER JOIN scale_groups
        ON scale.group_id = scale_groups.id
    GROUP BY 
        scale.name, scale.root_note, scale_groups.name
    HAVING
        `;

        let params = [];

    if (chordToLimitBy) {
        limiterNotes = formatLookupInput(chordToLimitBy);
        const placeholders = limiterNotes.map(() => '?').join(', ');
        sql += `COUNT(CASE WHEN sn.note IN (${placeholders}) THEN 1 END) = LEAST(COUNT(DISTINCT sn.note),?) -- notes in MATCH_CHORD and number of matching notes in MATCH_CHORD_NOTES
                         AND `;

        params.push(...limiterNotes);
        params.push(limiterNotes.length);
    } 

    /*sql += `full_name REGEXP CONCAT("\\\\b",?,"\\\\b")
            ORDER BY
            `;*/
    /* sql += `full_name REGEXP CONCAT('.*\\\\b', ?, '\\\\b.*')
            ORDER BY
            `;*/
    sql += `full_name REGEXP CONCAT("\\\\b",?)
            ORDER BY
            `;
        
    params.push(userString);

    // if we have a selected scale (in case user only typed a partial name rather than root+name), order by the root note of that scale
    // if not, order by the root note of the selected chord if it exists
    // otherwise list will be ordered from default root note of A
    if (baseScaleNotes) {
        sql += `CASE 
            WHEN scale.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of scale user currently has selected (if any)
            ELSE 2
        END,
        `;
        params.push(baseScaleNotes[0]);
    } else if (chordToLimitBy) {
        limiterNotes = formatLookupInput(chordToLimitBy);
        sql += `CASE 
            WHEN scale.root_note >= ? THEN 1 -- Root Note alphabetical order starting on root note of scale user currently has selected (if any)
            ELSE 2
        END,
        `;
        params.push(limiterNotes[0]);
    }

    sql += `scale.root_note ASC;`;

    console.log(sql);
    console.log(params);


    let qResults = [];

    try {
        qResults = await fetchPreparedStatement(sql, params);
      } catch (error) {
        // Handle error
        console.error('Database.js fetch Error:', error);
        return null;
    }




    let results = [];

    qResults.forEach(ele => {
        const noteNameList = ele.notes.split(",");
        try{
            let scale = Scale.fromSimple(ele.root_note, ele.name, noteNameList);
            scale.groupID = ele.group_id;
            scale.groupName = ele.group_name;
            scale.rootNote = Note.fromName(scale.root);
            results.push(scale);
        } catch(err) {
        }
    });
    return results;
}
 
//ARG is a scale or notes array
// RETURN should be an array of scales that have N-1 amount of matching notes AND N-1 amount of notes. Meaning [C,E,G] might return [[C, G], [E,G], [C,E], etc...]
// USE user can see all the different ways of viewing their scale through the subsets
async function getSubscalesFromScale(scale, numberOfNotesToAlterBy = 1 , numberOfMatchingNotesToLeaveOut = 1 ) {
    let notes = formatLookupInput(obj);
    let notesListString = '("' + notes.join('","') + '")';
    let noteslength = notes.length - numberOfNotesToAlterBy;
    let sql = `SELECT
    s.name,
    s.mode_id,
    s.root_note,
    GROUP_CONCAT(sn.note) as notes
    FROM
    scales s
    INNER JOIN scale_has_note sn ON s.root_note = sn.root_note and s.name = sn.scale_name
    WHERE
    sn.scale_name = ANY (
        SELECT
        name 
        FROM
        scale_has_note
        where
        note IN ` + notesListString + `
        group by 
        name
        HAVING count(note) >= ` + noteslength + `
    ) AND  sn.root_note = ANY (
        SELECT
        root_note
        FROM
        scale_has_note
        where
        note IN ` + notesListString + `
        group by 
        name
        HAVING count(note) >= ` + noteslength + `
    )
    GROUP BY
    sn.scale_name, sn.root_note`;
    let qResults = await fetchSQL(sql);
    let results = [];
    qResults.forEach(ele => {
        try{
            results.push(new Scale.Scale(ele.root_note ,ele.mode_id,ele.name ));
        } catch(err) {
        }
    });
    return results;
}

module.exports = { 
    getChords,
    getScaleGroups,
    getScales,
    getChordExtensions,
    getChordAlterations,
    getChordAppendments,
    getChordDeductions,
    getChordRotations,
    getScaleAlterations,
    getScaleAppendments,
    getScaleDeductions,
    getScaleRotations,
    getScalesFromUserString,
    getChordCategoryAndTriadBase
 };
