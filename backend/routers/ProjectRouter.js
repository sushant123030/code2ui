const express = require('express');
const router = express.Router();
const multer = require('multer');
const Model = require('../models/ProjectModel');
const authenticateToken = require('../middleware/authenticateToken');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function createImageFallbackCode(format, fileName) {
  const comment = `<!-- Generated UI from ${fileName} -->\n`;

  if (format === 'react') {
    return `import React from "react";\n\nexport default function GeneratedUI() {\n  return (\n    <div className=\"min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6\">\n      <div className=\"max-w-3xl w-full rounded-[28px] border border-[#333333] bg-[#1A1A1A] p-8 shadow-[0_30px_70px_rgba(79,140,255,0.15)]\">\n        <h1 className=\"text-3xl font-semibold mb-4 text-white\">Generated UI</h1>\n        <p className=\"text-text-secondary mb-6\">This interface was generated from your uploaded image.</p>\n      </div>\n    </div>\n  );\n}\n`;
  }

  if (format === 'tailwind') {
    return `${comment}<div class=\"min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6\">\n  <div class=\"max-w-3xl w-full rounded-[28px] border border-[#333333] bg-[#1A1A1A] p-8 shadow-[0_30px_70px_rgba(79,140,255,0.15)]\">\n    <h1 class=\"text-3xl font-semibold mb-4 text-white\">Generated Tailwind UI</h1>\n    <p class=\"text-text-secondary mb-6\">This layout uses Tailwind classes generated from your image.</p>\n  </div>\n</div>\n`;
  }

  return `${comment}<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Generated UI</title>\n    <style>body{margin:0;min-height:100vh;background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;}</style>\n  </head>\n  <body>\n    <div style=\"padding:32px;max-width:900px;margin:0 auto;\">\n      <h1 style=\"color:#FFFFFF;font-size:2.25rem;margin-bottom:16px;\">Generated UI from Image</h1>\n      <p style=\"color:#B3B3B3;line-height:1.7;\">This placeholder HTML was generated from your uploaded image.</p>\n    </div>\n  </body>\n</html>`;
}

router.post('/add', authenticateToken, async (req, res) => {
    try {
        // const data = req.body;
        req.body.user = req.user.id || req.user._id; // Attach user ID from token
        const doc = await Model.create(req.body);
        res.status(201).json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});


router.get('/getbyuser', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const docs = await Model.find({ user: userId });
        res.status(200).json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const project = await Model.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to access this project' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.get('/getall', async (req, res) => {
    try {
        const docs = await Model.find();
        res.status(200).json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch all projects.', error: error.message });
    }
});


router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const project = await Model.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this project' });
        }
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (doc) {
            res.status(200).json({ message: 'Project deleted successfully', doc });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});


router.post('/generate-and-save', authenticateToken, async (req, res) => {
    try {
        const { prompt, projectId } = req.body;
        const userId = req.user.id || req.user._id;

        console.log('Received generate request:', { prompt: prompt?.substring(0, 50), projectId, userId });

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ message: 'Prompt is required.' });
        }

        console.log('Calling Gemini API for prompt:', prompt.substring(0, 50));
        const generatedResult = await require('../geminiService').getPromptResponse(prompt);
        console.log('Gemini response received, length:', generatedResult?.length);

        if (!generatedResult || !generatedResult.trim()) {
            console.error('Empty generation result');
            return res.status(500).json({ message: 'Failed to generate content.' });
        }

        let project;
        if (projectId && projectId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Updating existing project:', projectId);
            project = await Model.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found.' });
            }
            if (project.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to update this project.' });
            }
            project.prompt = prompt;
            project.code = generatedResult;
            project.updatedAt = new Date();
            await project.save();
        } else {
            console.log('Creating new project for user:', userId);
            project = await Model.create({
                user: userId,
                prompt,
                code: generatedResult,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('New project created:', project._id);
        }

        res.status(201).json({ html: generatedResult, projectId: project._id });
    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate and save project.', error: error.message });
    }
});

router.post('/generate-from-image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { format } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        if (!format) {
            return res.status(400).json({ message: 'Output format is required.' });
        }

        const code = createImageFallbackCode(format, file.originalname || 'uploaded-image');
        res.status(200).json({ code });
    } catch (error) {
        console.error('Generate-from-image Error:', error);
        res.status(500).json({ message: 'Failed to generate from image.', error: error.message });
    }
});

router.post("/create", authenticateToken, async (req, res) => {
    try {
        const { prompt, code, preview, createdAt } = req.body;
        req.body.user = req.user.id || req.user._id; // Attach user ID from token
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json({ message: "Project saved successfully", projectId: newProject._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving project" });
    }
});

router.post('/update-code', authenticateToken, async (req, res) => {
    try {
        const { projectId, code } = req.body;
        const userId = req.user.id || req.user._id;

        if (!projectId || !code) {
            return res.status(400).json({ message: 'projectId and code are required.' });
        }

        const doc = await Model.findByIdAndUpdate(
            projectId,
            { code: code, updatedAt: new Date() },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Verify user owns this project
        if (doc.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You cannot update this project.' });
        }

        res.status(200).json({ message: 'Code updated successfully', doc });

    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'Failed to update code.', error: error.message });
    }
});

router.get('/getbyid/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;
        
        // Check if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid project ID format.' });
        }

        const doc = await Model.findById(id);
        
        if (!doc) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Verify user owns this project
        if (doc.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        res.status(200).json(doc);
    } catch (error) {
        console.error('GetByID Error:', error);
        res.status(500).json({ message: 'Failed to fetch project.', error: error.message });
    }
});


router.post('/test-generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Test generate for prompt:', prompt);
        const generatedResult = await require('../geminiService').getPromptResponse(prompt);
        res.status(200).json({ html: generatedResult });
    } catch (error) {
        console.error('Test generate error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Public route for live preview - no authentication required
router.get('/live/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send('Invalid project ID format.');
        }

        const doc = await Model.findById(id);
        
        if (!doc) {
            return res.status(404).send('Project not found.');
        }

        // Check if the project has code
        if (!doc.code || !doc.code.trim()) {
            return res.status(404).send('No code available for this project.');
        }

        // Ensure the code is wrapped in proper HTML
        let htmlContent = doc.code.trim();
        if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
            // If it's not a complete HTML document, wrap it in one
            htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview - ${doc.prompt ? doc.prompt.substring(0, 50) : 'Generated UI'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; min-height: 100vh; }
      * { box-sizing: border-box; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        }

        // Set proper headers for HTML content
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.send(htmlContent);

    } catch (error) {
        console.error('Live Preview Error:', error);
        res.status(500).send('Failed to load live preview.');
    }
});

module.exports = router;