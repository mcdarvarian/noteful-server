function makeFolders() {
    return [
      {
        id: 1,
        name: 'First Folder'
      }
    ];
  }
  
  function makeNotes() {
    return [
      {
        id: 10,
        name: 'Noteeee',
        content: 'A note',
        modified: 'Oct 1',
        folderId: 10
      },
      {
        id: 11,
        name: 'OOOOOOO',
        content: 'A note',
        modified: 'Aug 1',
        folderId: 10
      },
      {
        id: 12,
        name: 'YEEEEEE',
        content: 'A note',
        modified: 'Jan 1',
        folderId: 10
      },
      {
        id: 13,
        name: 'Noteeeerrreerere',
        content: 'A note like no other',
        modified: 'Dec 1',
        folderId: 10
      }
    ];
  }
  
  
  function makeMaliciousFolder() {
    const maliciousFolder =
    {
      id: 9,
      name: 'Malice malice malice <script>alert("xss");</script>'
    }
  
    const expectedFolder =
    {
      id: 9,
      name: 'Malice malice malice &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }
  
    return maliciousFolder, expectedFolder;
  };
  
  module.exports = {
    makeFolders,
    makeNotes,
    makeMaliciousFolder
  };