import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test PDF file if it doesn't exist
const testPdfPath = path.join(__dirname, 'test-document.pdf');
if (!fs.existsSync(testPdfPath)) {
  // Create a simple PDF-like content (not a real PDF but enough for testing)
  fs.writeFileSync(testPdfPath, '%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF');
  console.log('Created test PDF file');
}

async function testDocumentAPI() {
  try {
    console.log('1. Testing /api/stats endpoint');
    const statsResponse = await fetch('http://localhost:5000/api/stats');
    const statsData = await statsResponse.json();
    console.log('Stats:', statsData);

    console.log('\n2. Testing /api/llm-routes endpoint');
    const routesResponse = await fetch('http://localhost:5000/api/llm-routes');
    const routesData = await routesResponse.json();
    console.log('LLM Routes:', routesData);

    console.log('\n3. Uploading test document');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath), {
      filename: 'financial-report.pdf',
      contentType: 'application/pdf'
    });

    const uploadResponse = await fetch('http://localhost:5000/api/documents/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    const uploadData = await uploadResponse.json();
    console.log('Upload response:', uploadData);
    
    const documentId = uploadData.document.id;
    
    console.log(`\n4. Processing document ${documentId}`);
    const processResponse = await fetch(`http://localhost:5000/api/documents/${documentId}/process`, {
      method: 'POST'
    });
    
    if (!processResponse.ok) {
      throw new Error(`Processing failed: ${processResponse.status} ${processResponse.statusText}`);
    }
    
    const processData = await processResponse.json();
    console.log('Process response:', processData);
    
    console.log('\n5. Polling document status...');
    // Poll for updates several times
    for (let i = 0; i < 10; i++) {
      console.log(`\nPoll attempt ${i + 1}`);
      const documentResponse = await fetch(`http://localhost:5000/api/documents/${documentId}`);
      const documentData = await documentResponse.json();
      console.log(`Document status: ${documentData.document.status}, progress: ${documentData.document.progress}%`);
      console.log(`Stage: ${documentData.document.stage || 'Not started'}`);
      console.log(`LLM Used: ${documentData.document.llmUsed || 'Not determined yet'}`);
      
      if (documentData.document.status === 'completed' || documentData.document.status === 'failed') {
        console.log('Processing complete!');
        break;
      }
      
      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n6. Final statistics:');
    const finalStatsResponse = await fetch('http://localhost:5000/api/stats');
    const finalStatsData = await finalStatsResponse.json();
    console.log('Final stats:', finalStatsData);
    
  } catch (error) {
    console.error('Error testing document API:', error);
  }
}

testDocumentAPI();