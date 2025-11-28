import React, { useState } from 'react';
import { Upload, Download, Loader2, ArrowLeft, FileText, History, Trash2 } from 'lucide-react';
import * as mammoth from 'mammoth';

const CVTemplateApp = () => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    aadharNumber: '',
    panNumber: '',
    noticePeriod: '',
    candidateType: 'External',
    interviewDate: '',
    startDate: '',
    workedForFord: 'No',
    workedAsAgency: 'No',
    cdsid: '',
    supervisor: '',
    projectDuration: '',
    exitReason: '',
    overallExperience: '',
    coreSkillExperience: '',
    qualifications: '',
    hackerRankScore: '',
    hackerRankTotal: '',
    skill1: '',
    skill2: '',
    skill3: '',
    bachelorDuration: '',
    bachelorDetails: '',
    masterDuration: '',
    masterDetails: '',
    employmentHistory: [],
    additionalDetails: ''
  });
  const [resumeParsed, setResumeParsed] = useState(false);
  const [parsedJsonText, setParsedJsonText] = useState('');
  const [parsedObject, setParsedObject] = useState(null);
  const [parsedResponseRaw, setParsedResponseRaw] = useState('');
  const [profileHistory, setProfileHistory] = useState([]);

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    const storedEmail = localStorage.getItem('altimetrik_user_email');
    if (storedEmail) {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
      loadProfileHistory(storedEmail);
    }
  }, []);

  // Load profile history for user
  const loadProfileHistory = (email) => {
    const historyKey = `cv_history_${email}`;
    const storedHistory = localStorage.getItem(historyKey);
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setProfileHistory(history);
      } catch (e) {
        console.error('Error loading history:', e);
        setProfileHistory([]);
      }
    }
  };

  // Save profile to history
  const saveProfileToHistory = () => {
    const profile = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      formData: { ...formData },
      photoPreview: photoPreview
    };

    const historyKey = `cv_history_${userEmail}`;
    const existingHistory = localStorage.getItem(historyKey);
    let history = [];

    if (existingHistory) {
      try {
        history = JSON.parse(existingHistory);
      } catch (e) {
        history = [];
      }
    }

    history.unshift(profile);
    localStorage.setItem(historyKey, JSON.stringify(history));
    setProfileHistory(history);

    alert('✅ Profile saved to history!');
  };

  // Delete profile from history
  const deleteProfile = (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    const historyKey = `cv_history_${userEmail}`;
    const updatedHistory = profileHistory.filter(p => p.id !== profileId);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setProfileHistory(updatedHistory);
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setLoginError('Please enter a valid email address');
      return;
    }

    if (!loginEmail.toLowerCase().endsWith('@altimetrik.com')) {
      setLoginError('Please use your Altimetrik email address (@altimetrik.com)');
      return;
    }

    localStorage.setItem('altimetrik_user_email', loginEmail);
    setUserEmail(loginEmail);
    setIsAuthenticated(true);
    loadProfileHistory(loginEmail);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('altimetrik_user_email');
    setIsAuthenticated(false);
    setUserEmail('');
    setLoginEmail('');
    setStep(1);
    setLoading(false);
    setResumeFile(null);
    setTemplateFile(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      firstName: '',
      lastName: '',
      aadharNumber: '',
      panNumber: '',
      noticePeriod: '',
      candidateType: 'External',
      interviewDate: '',
      startDate: '',
      workedForFord: 'No',
      workedAsAgency: 'No',
      cdsid: '',
      supervisor: '',
      projectDuration: '',
      exitReason: '',
      overallExperience: '',
      coreSkillExperience: '',
      qualifications: '',
      hackerRankScore: '',
      hackerRankTotal: '',
      skill1: '',
      skill2: '',
      skill3: '',
      bachelorDuration: '',
      bachelorDetails: '',
      masterDuration: '',
      masterDetails: '',
      employmentHistory: [],
      additionalDetails: ''
    });
    setResumeParsed(false);
    setParsedJsonText('');
    setParsedObject(null);
    setParsedResponseRaw('');
    setProfileHistory([]);
  };

  // Helper to format date as DD-Mon-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper to read multiple possible key names from parsed object
  const pickFirst = (obj, candidates) => {
    if (!obj) return '';
    for (const k of candidates) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) return obj[k];
    }
    return '';
  };

  // Open form helper
  const openForm = (maybeForm) => {
    if (maybeForm) setFormData(maybeForm);
    setStep(3);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('⚠️ Please upload a .docx file (Word 2007 or later format)');
        return;
      }
      setTemplateFile(file);
      alert(`✅ Template uploaded: ${file.name}`);
    }
  };

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script);

          await new Promise((res) => {
            script.onload = res;
          });

          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Extract text from Word document using mammoth
  const extractTextFromWord = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeFile(file);

    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    if (!apiKey) {
      alert('API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file.');
      return;
    }

    setLoading(true);

    try {
      let resumeText = '';

      console.log('📄 Processing file:', file.name, 'Type:', file.type);

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log('🔍 Detected PDF file, extracting text...');
        resumeText = await extractTextFromPDF(file);
        console.log('✅ PDF text extracted, length:', resumeText.length);
      }
      else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx')
      ) {
        console.log('🔍 Detected DOCX file, extracting text...');
        resumeText = await extractTextFromWord(file);
        console.log('✅ DOCX text extracted, length:', resumeText.length);
      }
      else if (
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        console.log('⚠️ DOC format detected. Converting to text (limited support)...');
        resumeText = await extractTextFromWord(file);
        console.log('✅ DOC text extracted, length:', resumeText.length);
      }
      else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        console.log('🔍 Detected text file, reading...');
        resumeText = await file.text();
      }
      else {
        console.log('⚠️ Unknown file type, attempting text extraction...');
        resumeText = await file.text();
      }

      resumeText = resumeText
        .replace(/\s+/g, ' ')
        .trim();

      if (!resumeText || resumeText.length < 50) {
        throw new Error('Could not extract meaningful text from the document. Please ensure the file is not corrupted or password-protected.');
      }

      const maxLength = 50000;
      if (resumeText.length > maxLength) {
        console.log(`⚠️ Resume truncated from ${resumeText.length} to ${maxLength} chars`);
        resumeText = resumeText.substring(0, maxLength);
      }

      console.log('📄 Final resume text length:', resumeText.length);
      console.log('📄 First 200 chars:', resumeText.substring(0, 200));

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: resumeText
              },
              {
                type: 'text',
                text: `Extract the following information from this resume and return ONLY a JSON object with no markdown formatting or backticks:
{
  "firstName": "candidate's first name",
  "lastName": "candidate's last name",
  "overallExperience": "total years of experience (e.g., '7.4 years')",
  "coreSkillExperience": "years in primary technology",
  "qualifications": "certifications or qualifications",
  "skill1": "top skill 1",
  "skill2": "top skill 2",
  "skill3": "top skill 3",
  "bachelorDuration": "bachelor duration if available",
  "bachelorDetails": "degree, course, university (e.g., 'B.Tech/B.E. SNS College of Engineering, Coimbatore')",
  "masterDuration": "master duration if available",
  "masterDetails": "degree, course, university if available",
  "employmentHistory": [
    {
      "duration": "Start Date to End Date (e.g., 'Jun 2018 to till date')",
      "company": "company name",
      "title": "job title",
      "technology": "technologies used",
      "role": "detailed role description and achievements"
    }
  ],
  "additionalDetails": "Extract ALL remaining professional information from the resume in a well-formatted, structured text format. Include these sections if present:

PROFESSIONAL SUMMARY
(Complete professional summary/objective from resume)

TECHNICAL SKILLS
(All technical skills organized by categories like: Cloud Platforms, Programming Languages, Databases, Tools, Frameworks, etc.)

PROFESSIONAL EXPERIENCE (DETAILED)
(For each job, include: Company, Duration, Project name, Tech Stack, Key Responsibilities in detail, Achievements)

KEY ACHIEVEMENTS
(All notable achievements, awards, recognitions)

CERTIFICATIONS & TRAINING
(All certifications, courses, training programs)

DOMAIN EXPERTISE
(Areas of domain knowledge and expertise)

PROJECTS
(Any academic or personal projects)

PUBLICATIONS & RESEARCH
(Any published papers or research work)

PROFESSIONAL MEMBERSHIPS
(Associations, communities, memberships)

Include ALL professional information that adds value to the candidate profile.
EXCLUDE: Phone numbers, email addresses, physical addresses, date of birth, religion, marital status, nationality, languages spoken (unless professionally relevant), gender, photographs, passport details, Aadhar/PAN numbers.
Format this as clear, readable text with proper section headings and line breaks."
}

IMPORTANT: Return ONLY the JSON object, no other text.`
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      console.log('✅ API Response received');
      console.log('📡 Raw server response:', data);
      setParsedResponseRaw(JSON.stringify(data, null, 2));

      const extractTextFromServerResponse = (resp) => {
        if (!resp) return '';
        if (resp.content && Array.isArray(resp.content)) {
          return resp.content.filter(item => item.type === 'text').map(item => item.text || '').join('\n');
        }
        if (resp.choices && Array.isArray(resp.choices) && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content) {
          return resp.choices[0].message.content;
        }
        if (typeof resp === 'string') return resp;
        if (resp.message && resp.message.content) return resp.message.content;
        return '';
      };

      const textContent = extractTextFromServerResponse(data).trim();

      console.log('📝 Extracted text:', textContent.substring(0, 200));

      if (!textContent) {
        throw new Error('No text content in API response');
      }

      const cleanedText = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let parsed = {};
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse JSON from AI response:', e, cleanedText);
        throw new Error('Failed to parse resume data from the parser.');
      }
      console.log('✅ Parsed data:', parsed);

      setParsedJsonText(cleanedText);
      setParsedObject(parsed);
      setParsedResponseRaw(JSON.stringify(data, null, 2));

      const getParsedOrExisting = (candidates, existingVal) => {
        const v = pickFirst(parsed, candidates);
        return (v !== undefined && v !== null && String(v).trim() !== '') ? v : existingVal;
      };

      const parsedForm = {
        ...formData,
        firstName: getParsedOrExisting(['firstName', 'first_name', 'firstname', 'FirstName'], formData.firstName),
        lastName: getParsedOrExisting(['lastName', 'last_name', 'lastname', 'LastName'], formData.lastName),
        overallExperience: getParsedOrExisting(['overallExperience', 'overall_experience', 'experience'], formData.overallExperience),
        coreSkillExperience: getParsedOrExisting(['coreSkillExperience', 'core_skill_experience'], formData.coreSkillExperience),
        qualifications: getParsedOrExisting(['qualifications', 'qualification', 'qualificationsList'], formData.qualifications),
        skill1: getParsedOrExisting(['skill1', 'topSkill1', 'skill_1'], formData.skill1),
        skill2: getParsedOrExisting(['skill2', 'topSkill2', 'skill_2'], formData.skill2),
        skill3: getParsedOrExisting(['skill3', 'topSkill3', 'skill_3'], formData.skill3),
        bachelorDuration: getParsedOrExisting(['bachelorDuration', 'bachelor_duration'], formData.bachelorDuration),
        bachelorDetails: getParsedOrExisting(['bachelorDetails', 'bachelor_details'], formData.bachelorDetails),
        masterDuration: getParsedOrExisting(['masterDuration', 'master_duration'], formData.masterDuration),
        masterDetails: getParsedOrExisting(['masterDetails', 'master_details'], formData.masterDetails),
        employmentHistory: (parsed.employmentHistory && parsed.employmentHistory.length > 0) ? parsed.employmentHistory : (parsed.employment_history && parsed.employment_history.length > 0) ? parsed.employment_history : (parsed.employment && parsed.employment.length > 0) ? parsed.employment : formData.employmentHistory,
        additionalDetails: getParsedOrExisting(['additionalDetails', 'additional_details', 'otherDetails', 'additionalInfo'], formData.additionalDetails) || ''
      };

      setFormData(parsedForm);
      setResumeParsed(true);

      console.log('✅ Form data updated successfully');
      console.log('📋 Additional Details:', parsedForm.additionalDetails || '(empty)');

      const parserReturnedAnything = Object.keys(parsed).some(k => {
        const v = parsed[k];
        if (!v) return false;
        if (Array.isArray(v)) return v.length > 0;
        return String(v).trim() !== '';
      });

      if (!parserReturnedAnything) {
        alert('⚠️ Resume parsed but the parser could not extract fields. Please fill details manually.');
      } else {
        alert('✅ Resume parsed successfully! Please upload a photo, then click "Proceed to Form" button.');
      }

    } catch (error) {
      console.error('❌ Detailed error:', error);
      alert(`❌ Error parsing resume: ${error.message}\n\nYou can still proceed and fill the form manually.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const handleEmploymentChange = (index, field, value) => {
    const updated = [...formData.employmentHistory];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, employmentHistory: updated }));
  };

  const addEmployment = () => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: [...prev.employmentHistory, {
        duration: '',
        company: '',
        title: '',
        technology: '',
        role: ''
      }]
    }));
  };

  const removeEmployment = (index) => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter((_, i) => i !== index)
    }));
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('cv-preview-content');

    if (window.html2pdf) {
      const opt = {
        margin: 10,
        filename: `${formData.firstName}_${formData.lastName}_MSXi_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(element).save();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      const opt = {
        margin: 10,
        filename: `${formData.firstName}_${formData.lastName}_MSXi_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(element).save();
    };
  };

  // Download using template file
  const downloadUsingTemplate = async (data, photo) => {
    try {
      setLoading(true);

      // Dynamically import required libraries
      const PizZip = (await import('pizzip')).default;
      const Docxtemplater = (await import('docxtemplater')).default;
      const ImageModule = (await import('docxtemplater-image-module-free')).default;
      const { saveAs } = await import('file-saver');

      // Read template file
      const templateArrayBuffer = await templateFile.arrayBuffer();
      const zip = new PizZip(templateArrayBuffer);

      // Helper to convert base64 to buffer
      const base64DataURLToArrayBuffer = (dataURL) => {
        const base64 = dataURL.split(',')[1];
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      };

      // Configure image module
      const imageOpts = {
        centered: false,
        getImage: (tagValue) => {
          return base64DataURLToArrayBuffer(tagValue);
        },
        getSize: () => {
          return [230, 250];
        }
      };

      const imageModule = new ImageModule(imageOpts);

      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule]
      });

      // Prepare template data
      const templateData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        noticePeriod: data.noticePeriod || '',
        candidateType: data.candidateType || 'External',
        interviewDate: formatDate(data.interviewDate) || 'DD-Mon-YYYY',
        startDate: formatDate(data.startDate) || 'DD-Mon-YYYY',
        workedForFord: data.workedForFord || 'No',
        workedForFordYes: data.workedForFord === 'Yes' ? '☑' : '☐',
        workedForFordNo: data.workedForFord === 'No' ? '☑' : '☐',
        workedAsAgency: data.workedAsAgency || 'No',
        workedAsAgencyYes: data.workedAsAgency === 'Yes' ? '☑' : '☐',
        workedAsAgencyNo: data.workedAsAgency === 'No' ? '☑' : '☐',
        cdsid: data.cdsid || '',
        supervisor: data.supervisor || '',
        projectDuration: data.projectDuration || '',
        exitReason: data.exitReason || '',
        overallExperience: data.overallExperience || '',
        coreSkillExperience: data.coreSkillExperience || '',
        qualifications: data.qualifications || '',
        hackerRankScore: data.hackerRankScore || '',
        hackerRankTotal: data.hackerRankTotal || '',
        hackerRankFull: `${data.hackerRankScore || ''} / ${data.hackerRankTotal || ''}`,
        skill1: data.skill1 || '',
        skill2: data.skill2 || '',
        skill3: data.skill3 || '',
        bachelorDuration: data.bachelorDuration || '',
        bachelorDetails: data.bachelorDetails || '',
        masterDuration: data.masterDuration || '',
        masterDetails: data.masterDetails || '',
        employmentHistory: (data.employmentHistory || []).map(emp => ({
          duration: emp.duration || '',
          company: emp.company || '',
          title: emp.title || '',
          technology: emp.technology || '',
          role: emp.role || ''
        })),
        additionalDetails: (data.additionalDetails || '').trim(),
        hasAdditionalDetails: !!(data.additionalDetails && data.additionalDetails.trim()),
        photo: photo || '',
        hasPhoto: !!photo
      };

      // Render the document
      doc.render(templateData);

      // Generate the document
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // Save the file
      saveAs(output, `${data.firstName}_${data.lastName}_MSXi_Resume.docx`);

      setLoading(false);
      alert('✅ Word document generated from template successfully!');
    } catch (error) {
      setLoading(false);
      console.error('Error generating document from template:', error);
      alert(`❌ Error: ${error.message}\n\nPlease ensure your template uses the correct placeholders:\n{firstName}, {lastName}, {overallExperience}, etc.`);
    }
  };

  const downloadAsWord = async (profileData = null, profilePhoto = null) => {
    const data = profileData || formData;
    const photo = profilePhoto || photoPreview;

    // If template file is provided, use template-based generation
    if (templateFile) {
      return downloadUsingTemplate(data, photo);
    }

    // Otherwise use basic Word generation
    alert('⚠️ No template uploaded. Please upload a Word template for best results, or this will generate a basic document.');
  };

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Template Portal</h1>
            <p className="text-gray-600">Sign in with your Altimetrik email</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              placeholder="yourname@altimetrik.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {loginError}
              </p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              For local development only. Production will use Altimetrik SSO.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // History Page (Step 5)
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Upload
                </button>
                <h1 className="text-3xl font-bold text-blue-900">History of Converted Profiles</h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Logged in as:</strong> {userEmail}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Total profiles saved: {profileHistory.length}
              </p>
            </div>

            {profileHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No profiles yet</h3>
                <p className="text-gray-500 mb-6">
                  Your converted profiles will appear here after you save them from the preview page.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  Create Your First Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profileHistory.map((profile) => (
                  <div key={profile.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          {profile.photoPreview && (
                            <img
                              src={profile.photoPreview}
                              alt="Profile"
                              className="w-16 h-16 object-cover rounded border-2 border-blue-900"
                            />
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {profile.formData.firstName} {profile.formData.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Saved on {new Date(profile.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Experience:</span>
                            <p className="text-gray-600">{profile.formData.overallExperience || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Core Skill:</span>
                            <p className="text-gray-600">{profile.formData.coreSkillExperience || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Type:</span>
                            <p className="text-gray-600">{profile.formData.candidateType}</p>
                          </div>
                        </div>

                        {profile.formData.skill1 && (
                          <div className="mt-3">
                            <span className="text-xs font-semibold text-gray-700">Top Skills: </span>
                            <span className="text-xs text-gray-600">
                              {[profile.formData.skill1, profile.formData.skill2, profile.formData.skill3]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => downloadAsWord(profile.formData, profile.photoPreview)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition text-sm whitespace-nowrap"
                        >
                          <FileText className="h-4 w-4" />
                          Download Word
                        </button>
                        <button
                          onClick={() => deleteProfile(profile.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900">Upload Resume & Details</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(5)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                <History className="w-4 h-4" />
                View History
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-800 font-medium">
                OpenAI API Key configured from environment variables
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Word Template (Optional - Recommended) *
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <Upload className="mx-auto h-10 w-10 text-blue-400 mb-2" />
              <input
                type="file"
                accept=".docx"
                onChange={handleTemplateUpload}
                className="hidden"
                id="template-upload"
              />
              <label
                htmlFor="template-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to upload Word template (.docx)
              </label>
              {templateFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Uploaded: {templateFile.name}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Upload your CV template with placeholders like {'{'}firstName{'}'}, {'{'}lastName{'}'}, etc.
              </p>
            </div>
            {!templateFile && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Uploading a template is highly recommended! It will use your exact formatting, logos, and styling.
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Resume (PDF, Word, or Text) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to upload resume
              </label>
              {resumeFile && (
                <p className="mt-2 text-sm text-gray-600">
                  ✓ Uploaded: {resumeFile.name}
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supports PDF, Word (.doc, .docx), and text files
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to upload photo
              </label>
              {photoPreview && (
                <div className="mt-4">
                  <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          {resumeParsed && (
            <div className="mb-6 border rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Parsed Resume Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-700">First Name</p>
                  <p className="font-medium">{formData.firstName || (parsedObject && parsedObject.firstName) || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Last Name</p>
                  <p className="font-medium">{formData.lastName || (parsedObject && parsedObject.lastName) || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Overall Experience</p>
                  <p className="font-medium">{formData.overallExperience || (parsedObject && parsedObject.overallExperience) || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Core Skill Experience</p>
                  <p className="font-medium">{formData.coreSkillExperience || (parsedObject && parsedObject.coreSkillExperience) || '—'}</p>
                </div>
              </div>

              <h4 className="font-semibold mb-2">Ready checklist</h4>
              <ul className="list-inside list-none space-y-1 text-sm">
                <li>
                  {resumeParsed ? (
                    <span className="text-green-700">✓ Resume parsed</span>
                  ) : (
                    <span className="text-red-600">✕ Resume not parsed</span>
                  )}
                </li>
                <li>
                  {photoPreview ? (
                    <span className="text-green-700">✓ Photo uploaded</span>
                  ) : (
                    <span className="text-red-600">✕ Photo missing</span>
                  )}
                </li>
              </ul>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg mb-4">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-blue-900 font-medium">Parsing resume with AI...</span>
            </div>
          )}

          <button
            onClick={() => openForm()}
            disabled={!resumeFile || !photoFile || loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Proceed to Form
          </button>

          {templateFile && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                ✓ Template loaded: <strong>{templateFile.name}</strong>
                <br />
                <span className="text-xs">Your final document will use this template's formatting</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-blue-900">Candidate Information</h1>
            <div className="flex items-center gap-2">
              {formData.firstName && (
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  ✓ Auto-filled
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name (As per Passport/Aadhar) *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name (As per Passport/Aadhar) *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Period
              </label>
              <input
                type="text"
                value={formData.noticePeriod}
                onChange={(e) => handleChange('noticePeriod', e.target.value)}
                placeholder="e.g., 2 months, 30 days"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal or External Candidate
              </label>
              <select
                value={formData.candidateType}
                onChange={(e) => handleChange('candidateType', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option>External</option>
                <option>Internal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Availability Date
              </label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) => handleChange('interviewDate', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Availability Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worked directly for Ford before?
              </label>
              <select
                value={formData.workedForFord}
                onChange={(e) => handleChange('workedForFord', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worked for Ford as Agency worker?
              </label>
              <select
                value={formData.workedAsAgency}
                onChange={(e) => handleChange('workedAsAgency', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>

          {(formData.workedForFord === 'Yes' || formData.workedAsAgency === 'Yes') && (
            <div className="border-l-4 border-blue-500 pl-4 mb-6">
              <h3 className="font-semibold mb-4">Previous Ford Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="CDSID"
                  value={formData.cdsid}
                  onChange={(e) => handleChange('cdsid', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Supervisor"
                  value={formData.supervisor}
                  onChange={(e) => handleChange('supervisor', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Project Duration"
                  value={formData.projectDuration}
                  onChange={(e) => handleChange('projectDuration', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Exit Reason"
                  value={formData.exitReason}
                  onChange={(e) => handleChange('exitReason', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall IT Experience
              </label>
              <input
                type="text"
                value={formData.overallExperience}
                onChange={(e) => handleChange('overallExperience', e.target.value)}
                placeholder="e.g., 7.4 years"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience in Core Skill
              </label>
              <input
                type="text"
                value={formData.coreSkillExperience}
                onChange={(e) => handleChange('coreSkillExperience', e.target.value)}
                placeholder="e.g., 5 years"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Qualifications/Certifications
            </label>
            <textarea
              value={formData.qualifications}
              onChange={(e) => handleChange('qualifications', e.target.value)}
              rows="2"
              placeholder="e.g., AWS Certified, Scrum Master"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hacker Rank Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.hackerRankScore}
                  onChange={(e) => handleChange('hackerRankScore', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  placeholder="Score"
                />
                <span className="text-gray-600">/</span>
                <input
                  type="text"
                  value={formData.hackerRankTotal}
                  onChange={(e) => handleChange('hackerRankTotal', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  placeholder="Total"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top 3 Relevant Skills
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Skill 1"
                value={formData.skill1}
                onChange={(e) => handleChange('skill1', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Skill 2"
                value={formData.skill2}
                onChange={(e) => handleChange('skill2', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Skill 3"
                value={formData.skill3}
                onChange={(e) => handleChange('skill3', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-8">Education History</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">University Degree Bachelor</h3>
            <input
              type="text"
              placeholder="Duration (if available)"
              value={formData.bachelorDuration}
              onChange={(e) => handleChange('bachelorDuration', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />
            <input
              type="text"
              placeholder="Degree, Course, University (e.g., B.Tech/B.E. SNS College of Engineering, Coimbatore)"
              value={formData.bachelorDetails}
              onChange={(e) => handleChange('bachelorDetails', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">University Degree Master (Optional)</h3>
            <input
              type="text"
              placeholder="Duration (if available)"
              value={formData.masterDuration}
              onChange={(e) => handleChange('masterDuration', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />
            <input
              type="text"
              placeholder="Degree, Course, University"
              value={formData.masterDetails}
              onChange={(e) => handleChange('masterDetails', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-8">Employment History</h2>

          {formData.employmentHistory.map((emp, index) => (
            <div key={index} className="border border-gray-300 rounded p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Employment {index + 1}</h3>
                <button
                  onClick={() => removeEmployment(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Duration (e.g., Jun 2018 to till date)"
                value={emp.duration}
                onChange={(e) => handleEmploymentChange(index, 'duration', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={emp.company}
                onChange={(e) => handleEmploymentChange(index, 'company', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Job Title"
                value={emp.title}
                onChange={(e) => handleEmploymentChange(index, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Technology Handled"
                value={emp.technology}
                onChange={(e) => handleEmploymentChange(index, 'technology', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              <textarea
                placeholder="Role Description and Achievements"
                value={emp.role}
                onChange={(e) => handleEmploymentChange(index, 'role', e.target.value)}
                rows="4"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}

          <button
            onClick={addEmployment}
            className="w-full border-2 border-dashed border-gray-300 rounded py-2 mb-6 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
          >
            + Add Employment
          </button>

          <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-8">Additional Professional Details</h2>
          <p className="text-sm text-gray-600 mb-2">
            This section contains comprehensive professional information from the resume including: Professional Summary, Technical Skills, Detailed Experience, Achievements, Certifications, Domain Expertise, etc.
          </p>
          <textarea
            value={formData.additionalDetails}
            onChange={(e) => handleChange('additionalDetails', e.target.value)}
            rows="15"
            placeholder="PROFESSIONAL SUMMARY
(Your professional summary here)

TECHNICAL SKILLS
Cloud Platforms: AWS, Azure, GCP
Programming: Python, SQL, Java
Databases: PostgreSQL, MySQL
Tools: Jenkins, Git, Docker

PROFESSIONAL EXPERIENCE (DETAILED)
(Detailed job descriptions with responsibilities)

KEY ACHIEVEMENTS
• Achievement 1
• Achievement 2

CERTIFICATIONS & TRAINING
(Your certifications)

DOMAIN EXPERTISE
(Your areas of expertise)"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6 font-mono text-sm"
          />

          <button
            onClick={() => setStep(4)}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Generate Preview
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    let fordLogo;
    let maagnitLogo;
    try {
      fordLogo = require('./assets/ford.jpg');
    } catch (e) {
      fordLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Cellipse cx='100' cy='40' rx='95' ry='35' fill='%230f3f8f' stroke='%23fff' stroke-width='3'/%3E%3Ctext x='100' y='52' font-family='serif' font-size='36' font-style='italic' fill='%23fff' text-anchor='middle'%3EFord%3C/text%3E%3C/svg%3E";
    }

    try {
      maagnitLogo = require('./assets/magnit.jpg');
    } catch (e) {
      maagnitLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80'%3E%3Ccircle cx='25' cy='20' r='8' fill='%232563eb'/%3E%3Crect x='10' y='30' width='15' height='35' fill='%232563eb' rx='2'/%3E%3Crect x='17' y='40' width='25' height='15' fill='%23ef4444' rx='2'/%3E%3Ccircle cx='20' cy='72' r='5' fill='%23ef4444'/%3E%3Ccircle cx='35' cy='72' r='5' fill='%23ef4444'/%3E%3Ctext x='55' y='55' font-family='Arial, sans-serif' font-size='42' font-weight='500' fill='%232563eb'%3EMaagnit%3C/text%3E%3C/svg%3E";
    }

    return (
      <>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .preview-content { margin: 0; padding: 8px; }
          }
          body, * { font-family: Arial, sans-serif; }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.04);
            pointer-events: none;
            z-index: 1;
            user-select: none;
          }
          .content-wrapper { position: relative; z-index: 2; }
          .cv-title-bar { background-color: #0b3766; color: white; padding: 2px 12px; margin: 0px 40px; font-family: Arial, sans-serif; }
          .cv-title-bar-edu { background-color: #0b3766; color: white; padding: 2px 12px; font-family: Arial, sans-serif; }
          .cv-title-bar h1 { font-size: 20px;letter-spacing: 1px;height: 30px;font-weight: bold; font-family: Arial, sans-serif; }
           .cv-title-bar-edu h1 { font-size: 20px;letter-spacing: 1px;height: 30px;font-weight: bold; font-family: Arial, sans-serif; }
           .full-width{width:530px;}
           .footerText{color:#0b3766; font-family: Arial, sans-serif;}
          .cv-outer { border: 1px solid #0b3766; }
          .cv-inner { border: 1px solid #000;margin: 25px 40px; }
          .photo-frame { border: 3px solid #1e60a6; padding: 6px; background: white; }
          .field-label { color: #0b3766; font-weight: 700; font-family: Arial, sans-serif; }
          .small-muted { color: #6b7280; font-size: 12px; font-family: Arial, sans-serif; }
        `}</style>

        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto mb-4 no-print flex gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </button>
              <button
                onClick={downloadAsPDF}
                className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 inline-flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
              </button>
              <button
                onClick={() => downloadAsWord()}
                className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 inline-flex items-center"
                title={templateFile ? "Download using uploaded template" : "Download with basic formatting"}
              >
                <FileText className="mr-2 h-4 w-4" />
                {templateFile ? "Download (Template)" : "Download as Word"}
              </button>
              <button
                onClick={saveProfileToHistory}
                className="px-6 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 inline-flex items-center"
              >
                <History className="mr-2 h-4 w-4" />
                Save to History
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>



          <div id="cv-preview-content" className="preview-content max-w-4xl mx-auto bg-white shadow-lg content-wrapper cv-outer">
            <div className="watermark">CONFIDENTIAL</div>
            <div className="flex justify-between items-center p-6 pb-20">
              <div className="pl-4">
                <img src={fordLogo} alt="Ford Logo" className="h-18" />
              </div>
              <div className="pr-4">
                <img src={maagnitLogo} alt="Maagnit Logo" className="h-16" />
              </div>
            </div>

            <div className="cv-title-bar">
              <h1 className="text-center m-0">CV TEMPLATE</h1>
            </div>

            <div className="p-2 cv-inner bg-white">
              <div className="border border-transparent p-4 mb-6">
                <div className="grid grid-cols-3 gap-6 items-start">
                  <div className="col-span-2">
                    <p className="field-label">Candidate First Name: <span className="field-label">{formData.firstName}</span></p>
                    <p className="field-label">(As per Passport/Aadhar)</p>

                    <div className="mt-4">
                      <p className="field-label">Candidate Last Name: <span className="field-label">{formData.lastName}</span></p>
                      <p className="field-label">(As per Passport/Aadhar)</p>
                    </div>

                    <div className="mt-4">
                      <div>
                        <p className="field-label">Notice Period of the candidate:<span className="field-label">{formData.noticePeriod}</span></p>
                      </div>
                     </div>
                      <div className="mt-4">
                      <div>
                        <p className="field-label">Internal or External Candidate:<span className="field-label">{formData.candidateType}</span></p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div>
                        <p className="field-label">Interview Availability Date:<span className="field-label">{formatDate(formData.interviewDate) || 'DD-Mon-YYYY'}</span></p>
                      </div>
                    </div>
                      <div className="mt-4">
                      <div>
                        <p className="field-label">Start Availability Date:<span className="field-label">{formatDate(formData.startDate) || 'DD-Mon-YYYY'}</span></p>
                      </div>
                    </div>
                    <div className="full-width">
                      <div className="mt-4">
                        <p className="field-label">
                          Has the candidate worked directly for Ford before?
                          <span className="field-label">
                            <span style={{backgroundColor: formData.workedForFord === 'Yes' ? '#FFFF00' : 'transparent'}}>Yes</span>
                            /
                            <span style={{backgroundColor: formData.workedForFord === 'No' ? '#FFFF00' : 'transparent'}}>No</span>
                          </span>
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="field-label">
                          Has the candidate worked for Ford as an Agency worker before?
                          <span className="field-label">
                            <span style={{backgroundColor: formData.workedAsAgency === 'Yes' ? '#FFFF00' : 'transparent'}}>Yes</span>
                            /
                            <span style={{backgroundColor: formData.workedAsAgency === 'No' ? '#FFFF00' : 'transparent'}}>No</span>
                          </span>
                        </p>
                      </div>
                    </div>

                      <div className="mb-6 pl-6">
                        <p className="font-bold field-label">If yes to either of the above, please specify the below details:</p>
                        <div className="space-y-1 pl-10">
                          <p className="field-label"><span className="field-label">i. CDSID:</span> {formData.cdsid}</p>
                          <p className="field-label"><span className="field-label">ii. Supervisor:</span> {formData.supervisor}</p>
                          <p className="field-label"><span className="field-label">iii. Duration of the Project:</span> {formData.projectDuration}</p>
                          <p className="field-label"><span className="field-label">iv. Exit reason:</span> {formData.exitReason}</p>
                        </div>
                      </div>

                    <div className="mt-4">
                      <p className="field-label">Overall IT Experience:<span className="field-label">{formData.overallExperience}</span></p>
                    </div>
                    <div  className="mt-4">
                      <p className="field-label">Experience in Core Skill:<span className="field-label">{formData.coreSkillExperience}</span></p>
                    </div>
                    <div className="mt-4">
                      <p className="field-label">Other relevant Qualification/Certifications:<span className="field-label">{formData.qualifications}</span></p>
                    </div>

                    <div className="mt-4">
                      <p className="field-label">Hacker rank Score:<span className="field-label">{formData.hackerRankScore} / {formData.hackerRankTotal}</span></p>
                    </div>

                    <div className="mt-4">
                      <p className="field-label">Candidate's Top 3 relevant Skills:</p>
                      <p className="ml-4 field-label"><span className="field-label">i.</span> {formData.skill1}</p>
                      <p className="ml-4 field-label"><span className="field-label">ii.</span> {formData.skill2}</p>
                      <p className="ml-4 field-label"><span className="field-label">iii.</span> {formData.skill3}</p>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-90 photo-frame shadow-sm">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Candidate" className="w-full h-90 object-cover block" />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">Photo</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-start mt-5"></div>
                  <div className="cv-title-bar-edu">
                    <h1 className="text-center m-0">EDUCATIONAL HISTORY</h1>
                  </div>

                  <div className="mt-4">
                    <p className="field-label underline">Educational History:</p>
                    <p className="field-label underline">University Degree</p>
                    {formData.bachelorDuration && (
                      <p className="field-label underline mt-1">Duration: {formData.bachelorDuration}</p>
                    )}
                    <p className="field-label underline mt-1">{formData.bachelorDetails}</p>
                  </div>

                  {formData.masterDuration && (
                  <div className="mt-4">
                    <p className="field-label underline">University Degree Master</p>
                    <p className="field-label underline">Duration: {formData.masterDuration}</p>
                    <p className="mt-1 field-label underline">{formData.masterDetails}</p>
                  </div>
                )}

                 <div className="cv-title-bar-edu mt-4">
                    <h1 className="text-center m-0">EMPLOYMENT HISTORY (Please start with most recent employment)</h1>
                  </div>

                   {formData.employmentHistory.map((emp, index) => (
                  <div key={index} className="mb-4 mt-20 ml-20">
                    <ul className="list-none space-y-1">
                      <li className="footerText">- <span className="footerText">Start Date/End Date/Duration:</span> {emp.duration}</li>
                      <li className="footerText">- <span className="footerText">Company name:</span> {emp.company}</li>
                      <li className="footerText">- <span className="footerText">Job title:</span> {emp.title}</li>
                      <li className="footerText">- <span className="footerText">Technology handled in the Project:</span> {emp.technology}</li>
                      <li className="footerText">- <span className="footerText">Role of the candidate in the Project:</span> {emp.title}</li>
                    </ul>
                    {emp.role && (
                      <p className="footerText mt-4">{emp.role}</p>
                    )}
                  </div>
                ))}

                {formData.additionalDetails && formData.additionalDetails.trim() && (
                  <>
                    <div className="cv-title-bar-edu mt-8">
                      <h1 className="text-center m-0">ADDITIONAL PROFESSIONAL INFORMATION</h1>
                    </div>
                    <div className="mt-6 ml-20 mr-20 mb-8">
                      <div className="footerText whitespace-pre-line" style={{lineHeight: '1.6'}}>{formData.additionalDetails}</div>
                    </div>
                  </>
                )}


                </div>
              </div>



            </div>
          </div>
      </>
    );
  }

  return null;
};

export default CVTemplateApp;