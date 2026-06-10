import { Link } from 'react-router-dom';
import NeonButton from '../../components/ui/NeonButton';

export default function About() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12 max-w-4xl mx-auto">
      <h1 className="font-hero text-fluid-title font-bold gradient-text mb-8 text-center">About HARVOX AI</h1>
      <div className="prose prose-invert prose-lg max-w-none space-y-6 text-muted font-body">
        <p className="text-fluid-lead">
          HARVOX AI is a next-generation developer platform designed to supercharge your workflow with advanced artificial intelligence.
        </p>
        <p>
          Our mission is to provide developers with an all-in-one workspace where coding, debugging, planning, and learning happen seamlessly in one unified interface.
        </p>
        
        <h2 className="font-hero text-fluid-heading font-semibold text-white mt-8 mb-4">Core Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-fluid-body">
          <li><strong>Intelligent Workspace:</strong> Integrated code editor, terminal, and AI chat.</li>
          <li><strong>Code Generation:</strong> Instantly generate boilerplate, complex functions, and UI components.</li>
          <li><strong>Advanced Debugging:</strong> Paste an error, get a detailed analysis and the fix.</li>
          <li><strong>Project Architect:</strong> Scaffold entire MERN stack projects from a single idea prompt.</li>
          <li><strong>Document Analysis:</strong> Upload PDFs or DOCs to extract code, summarize, or generate notes.</li>
        </ul>

        <div className="mt-12 text-center">
          <Link to="/register">
            <NeonButton variant="primary" magnetic={true} size="lg">Get Started Free</NeonButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
