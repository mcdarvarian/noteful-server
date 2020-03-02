const NotesService = {

    getAllNotes(db) {
      return db.select('*').from('noteful_notes');
    },
  
    insertNote(db, newNote) {
      return db
        .insert(newNote)
        .into('noteful_notes')
        .returning('*')
        .then(rows => {
          return rows[0];
        });
    },
  
    getById(db, id) {
      return db
        .from('noteful_notes')
        .select('*')
        .where('id', id)
        .first();
    },
  
    deleteNote(db, id) {
      return db('noteful_notes')
        .where('id', id)
        .delete();
    },
  
    updateNote(db, id, newNoteFields) {
      return db('noteful_notes')
        .where({ id })
        .update(newNoteFields);
    },
  };
  
  module.exports = NotesService;