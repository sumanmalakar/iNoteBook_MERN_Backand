const express = require('express')
const router = express.Router();
const fetchuser = require("../middleware/fetchuser")
const Notes = require("../Models/Note")
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using : GET "api/notes/getuser". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });

    res.json(notes);
    // res.json([]);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured!");
  }

})



// ROUTE 2: Create a new NOTE : POST "api/notes/addnote". Login required
router.post('/addnote', fetchuser, [

  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),

], async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // if there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Notes({
      title,
      description,
      tag,
      user: req.user.id
    })

    const saveNote = await note.save();

    res.json(saveNote);
    // res.json([]);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured!");
  }

})



// ROUTE 3: Update an existing note using : PUT "api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // Create a newNote Object
  const newNote = {};
  if (title) { newNote.title = title };
  if (description) { newNote.description = description };
  if (tag) { newNote.tag = tag };

  // Find the note to be updated and update it
  let note = await Notes.findById(req.params.id);
  if (!note) {
    return res.status(401).send("Not Found");
  }

  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }

  note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

  res.json({ note });

})




// ROUTE 4: Delete an existing note using : DELETE "api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {


  try {
    // Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(401).send("Not Found");
    }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({ "Success": "Note has been deleted", note: note });

  }

  catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured!");
  }


})




module.exports = router