const FolderService = {

    getAllFolders(db) {
      return db.select('*').from('noteful_folders');
    },
  
    insertFolder(db, newFolder) {
      return db
        .insert(newFolder)
        .into('noteful_folders')
        .returning('*')
        .then(rows => {
          return rows[0];
        });
    },
  
    getById(db, id) {
      return db
        .from('noteful_folders')
        .select('*')
        .where('id', id)
        .first();
    },
  
    deleteFolder(db, id) {
      return db('noteful_folders')
        .where({ id })
        .delete();
    },
  
    updateFolder(db, id, newFolderFields) {
      return db('noteful_folders')
        .where({ id })
        .update(newFolderFields);
    },
  };
  
  module.exports = FolderService;