import questionbanksService from './questionbanks.service.js'

class QuestionBanksController {
  
  async list(req, res) {
    try {
      const { level, subject, type, limit, offset } = req.query
      const banks = await questionbanksService.listBanks({ level, subject, type, limit, offset })
      res.json({ success: true, data: banks })
    } catch (error) {
      console.error('❌ QuestionBanks list:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params
      const bank = await questionbanksService.getBankById(id)
      res.json({ success: true, data: bank })
    } catch (error) {
      console.error('❌ QuestionBanks getById:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getQCM(req, res) {
    try {
      const { bankId } = req.params
      const { chapter, difficulty, limit, offset } = req.query
      const qcm = await questionbanksService.getQCMByBank(bankId, { chapter, difficulty, limit, offset })
      res.json({ success: true, data: qcm })
    } catch (error) {
      console.error('❌ QuestionBanks getQCM:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getExercises(req, res) {
    try {
      const { bankId } = req.params
      const { chapter, difficulty, limit, offset } = req.query
      const exercises = await questionbanksService.getExercisesByBank(bankId, { chapter, difficulty, limit, offset })
      res.json({ success: true, data: exercises })
    } catch (error) {
      console.error('❌ QuestionBanks getExercises:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getRandomQCM(req, res) {
    try {
      const { bankId } = req.params
      const { difficulty, limit } = req.query
      const qcm = await questionbanksService.getRandomQCM({ bankId, difficulty, limit })
      res.json({ success: true, data: qcm })
    } catch (error) {
      console.error('❌ QuestionBanks getRandomQCM:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getRandomExercises(req, res) {
    try {
      const { bankId } = req.params
      const { difficulty, limit } = req.query
      const exercises = await questionbanksService.getRandomExercises({ bankId, difficulty, limit })
      res.json({ success: true, data: exercises })
    } catch (error) {
      console.error('❌ QuestionBanks getRandomExercises:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }
}

export default new QuestionBanksController()









