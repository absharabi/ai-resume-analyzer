import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = new PDFDocument({ margin: 50 });

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'sample-resume.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Header
doc.fontSize(24).font('Helvetica-Bold').text('John Smith', 50, 50);
doc.fontSize(12).font('Helvetica').text('Software Engineer', 50, 80);
doc.fontSize(10).text('john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith | github.com/johnsmith', 50, 100);

// Professional Summary
doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY', 50, 140);
doc.fontSize(10).font('Helvetica').text(
  'Experienced software engineer with 5+ years of expertise in full-stack development, ' +
  'specializing in React, Node.js, and cloud technologies. Proven track record of delivering ' +
  'scalable web applications and leading cross-functional teams.',
  50, 160, { width: 500 }
);

// Technical Skills
doc.fontSize(14).font('Helvetica-Bold').text('TECHNICAL SKILLS', 50, 220);
doc.fontSize(10).font('Helvetica').text(
  'Languages: JavaScript, TypeScript, Python, Java | ' +
  'Frameworks: React, Node.js, Express, Next.js | ' +
  'Tools: Git, Docker, AWS, MongoDB, PostgreSQL | ' +
  'Testing: Jest, Cypress, Mocha',
  50, 240, { width: 500 }
);

// Professional Experience
doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL EXPERIENCE', 50, 290);

// Job 1
doc.fontSize(12).font('Helvetica-Bold').text('Senior Software Engineer', 50, 315);
doc.fontSize(10).font('Helvetica').text('Tech Solutions Inc. | San Francisco, CA | Jan 2021 - Present', 50, 335);
doc.fontSize(10).font('Helvetica').text('• Led development of microservices architecture, reducing system latency by 40%', 50, 355, { width: 500 });
doc.fontSize(10).font('Helvetica').text('• Built responsive React applications serving 100K+ daily active users', 50, 375, { width: 500 });
doc.fontSize(10).font('Helvetica').text('• Mentored junior developers and conducted code reviews', 50, 395, { width: 500 });

// Job 2
doc.fontSize(12).font('Helvetica-Bold').text('Software Engineer', 50, 430);
doc.fontSize(10).font('Helvetica').text('Digital Innovations LLC | Seattle, WA | Jun 2019 - Dec 2020', 50, 450);
doc.fontSize(10).font('Helvetica').text('• Developed RESTful APIs using Node.js and Express', 50, 470, { width: 500 });
doc.fontSize(10).font('Helvetica').text('• Implemented automated testing, increasing code coverage to 85%', 50, 490, { width: 500 });
doc.fontSize(10).font('Helvetica').text('• Collaborated with design team to create intuitive user interfaces', 50, 510, { width: 500 });

// Education
doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION', 50, 555);
doc.fontSize(12).font('Helvetica-Bold').text('Bachelor of Science in Computer Science', 50, 575);
doc.fontSize(10).font('Helvetica').text('University of California, Berkeley | Berkeley, CA | 2015 - 2019', 50, 595);
doc.fontSize(10).font('Helvetica').text('GPA: 3.8/4.0 | Dean\'s List: 2017, 2018, 2019', 50, 615);

// Projects (if space allows)
doc.fontSize(14).font('Helvetica-Bold').text('KEY PROJECTS', 50, 655);
doc.fontSize(12).font('Helvetica-Bold').text('E-Commerce Platform', 50, 675);
doc.fontSize(10).font('Helvetica').text('Built full-stack e-commerce solution with React, Node.js, and MongoDB', 50, 695, { width: 500 });
doc.fontSize(10).font('Helvetica').text('Implemented payment processing and inventory management systems', 50, 715, { width: 500 });

doc.end();

stream.on('finish', () => {
  console.log('Sample resume PDF generated successfully at:', outputPath);
});

