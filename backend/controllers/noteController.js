const Note = require('../models/Note');

// @desc    Get all notes of the logged-in user
// @route   GET /api/notes
// @access  Private
const getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upsert a note for a question
// @route   PUT /api/notes/:questionId
// @access  Private
const upsertNote = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let note = await Note.findOne({ user: req.user._id, question: questionId });

    if (note) {
      if (content.trim() === '') {
        await Note.findByIdAndDelete(note._id);
        return res.json({ message: 'Note deleted', status: 'deleted' });
      }
      note.content = content;
      await note.save();
    } else {
      if (content.trim() !== '') {
        note = await Note.create({
          user: req.user._id,
          question: questionId,
          content: content
        });
      } else {
        return res.json({ message: 'No note created for empty content', status: 'noop' });
      }
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:questionId
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const { questionId } = req.params;
    await Note.findOneAndDelete({ user: req.user._id, question: questionId });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserNotes,
  upsertNote,
  deleteNote
};
