import exercisesService from './exercises.service.js'

class ExercisesController {
  async getFromMicrolessons(req, res) {
    try {
      const { level, subject, difficulty, limit } = req.query
      const exercises = await exercisesService.getExercisesFromMicrolessons({
        level,
        subject,
        difficulty,
        limit: parseInt(limit) || 50
      })
      res.json({ success: true, data: exercises })
    } catch (error) {
      console.error('❌ Exercises getFromMicrolessons:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }
}

export default new ExercisesController()









