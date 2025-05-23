import React, { useState } from 'react';
import { Target, Check, AlertTriangle, BookOpen, Link, FileText, UserCheck, DollarSign, Clock, ExternalLink, MessageCircle, Edit, Info, ChevronDown, ChevronUp, X as LucideX } from 'lucide-react'; // Renamed X to LucideX
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import EmptyState from '../shared/EmptyState';
import '../sections/ProblemSection.css'; // Assuming ProblemSection.css exists and is suitable

const ProblemSectionMock: React.FC = () => {
  // Updated to reflect the mock business idea being analyzed
  const mockBusinessIdeaName = "AI Fitness Planner"; 
  const mockBusinessIdeaDescription = "A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.";
  const mockProblemStatement = "Users struggle with generic fitness apps, needing truly personalized meal plans and adaptive workouts that fit their unique goals and lifestyles.";

  // Hardcoded mock data for Problem Validation of the AI Fitness Planner
  const mockProblemData = {
    problem_statement: mockProblemStatement,
    problem_validation: {
      exists: true,
      severity: 8,
      frequency: 7,
      urgency: 7,
      willingness_to_pay_score: 7, 
      willingness_to_pay_text: "Users willing to pay $10-$30/month for effective solutions.",
      effort_to_solve: 4, 
      summary: "The core problem of adhering to fitness and diet plans is significant, frequently encountered, and users show willingness to pay for effective, personalized solutions. Current alternatives often lack true personalization or comprehensive integration of diet and exercise.",
      confidence_level: 8.5, 
      evidence: [
        {
          source: "Survey: 'State of Personal Fitness 2024'",
          type: "Research Study",
          date: "2024-02-10",
          quotes: [
            "72% of respondents find it challenging to stick to a workout routine for more than 3 months.",
            "Over 60% cited lack of personalized meal plans as a barrier to healthy eating."
          ]
        },
        {
          source: "Fitness App Review Aggregator (AppFollow)",
          type: "Review Analysis",
          date: "2024-04-01",
          quotes: [
            "Users frequently request more adaptive workout plans based on their progress.",
            "Common complaint: Meal suggestions are too generic or don\'t match dietary restrictions easily."
          ]
        },
        {
          source: "Reddit r/fitness & r/loseit Threads",
          type: "Forum Discussion",
          date: "Ongoing",
          quotes: [
            "'I know what to do generally, but get overwhelmed planning meals and workouts every week.'",
            "'Most apps just give you a static plan. I need something that changes with me.'"
          ]
        }
      ],
      alternative_solutions: [
        {
          name: "Generic Fitness Apps (e.g., basic trackers, YouTube workouts)",
          approach: "Provide pre-set workout videos, exercise libraries, or basic tracking.",
          limitations: "Often lack true personalization, diet integration, or progressive planning."
        },
        {
          name: "Hiring Personal Trainers & Nutritionists",
          approach: "Provide 1-on-1 human expert guidance.",
          limitations: "Expensive, time-consuming for scheduling, may not be available 24/7 for motivation/queries."
        },
        {
          name: "Manual Planning (Spreadsheets, Notebooks)",
          approach: "User researches and creates their own plans.",
          limitations: "Time-intensive, requires significant knowledge, difficult to adapt and track progress effectively."
        }
      ],
      problem_statement_feedback: "The refined problem statement accurately captures the core challenges for the AI Fitness Planner."
    },
    interview_insights: {
      summary: "Interviews confirmed that users feel overwhelmed by information, desire convenience, and are motivated by seeing tangible progress. They value personalization highly but find current app offerings either too generic or too demanding to manage.",
      key_quotes: [
        "I start strong, but then life happens, and my plan falls apart. I need something that adapts with me.",
        "Counting calories is a pain, and most recipe suggestions are bland or don\'t fit my family\'s needs.",
        "I\'d pay for an app that genuinely felt like a personal coach in my pocket for both food and exercise."
      ],
      confirmed_assumptions: ["Users struggle with long-term adherence.", "Personalization is highly valued.", "Integration of diet and exercise is a key need."],
      invalidated_assumptions: ["Users are not necessarily looking for extreme, quick-fix solutions but sustainable lifestyle changes."],
      key_pain_points: ["Information overload from various sources.", "Lack of time for meal prep and complex workout scheduling.", "Difficulty tracking progress meaningfully and staying motivated."]
    },
    survey_results: {
      respondents: 500,
      completion_rate: "85%",
      target_segments_reached: 3, 
      problem_experience_rate: "78%",
      current_solution_satisfaction: "4.5/10",
      interest_in_new_solution: "85% expressed high interest",
      willingness_to_pay: { average: "$15/month", frequency: "Monthly", range: "$10 - $25/month" },
      feature_priorities: [
        { name: "Adaptive AI-driven meal & workout plans", score: 9.2 },
        { name: "Easy progress tracking & visual feedback", score: 8.8 },
        { name: "Recipe database with grocery list generation", score: 8.5 },
        { name: "Quick at-home workout options (15-30 mins)", score: 8.1 }
      ]
    },
    sources: [
        { name: "Internal User Survey Q1 2024 for Fitness Apps", type: "Survey"},
        { name: "Competitor App Review Analysis (Jan-Mar 2024 Fitness Market)", type: "Market Research"},
        { name: "Focus Group Interviews (Feb 2024 re: Health Habits)", type: "Interviews"}
    ],
    confidence_score: 8 
  };

  const { problem_statement, problem_validation, interview_insights, survey_results, sources, confidence_score } = mockProblemData;

  // ---- Logic from original ProblemSection.tsx ----
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#22c55e';  // Green
    if (score >= 5) return '#f59e0b';  // Amber
    return '#ef4444';  // Red
  };
  const widthPercentage = (score: number) => `${Math.max(Math.min(score * 10, 100), 0)}%`;
  const getEvidenceIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case 'forum': case 'forum discussion': return <MessageCircle className="evidence-icon forum" />;
      case 'news': return <FileText className="evidence-icon news" />;
      case 'research study': return <BookOpen className="evidence-icon research" />;
      case 'review analysis': return <UserCheck className="evidence-icon review" />;
      default: return <Link className="evidence-icon default" />;
    }
  };
  const formatWTP = (wtp: string | number) => typeof wtp === 'string' ? (wtp.startsWith('$') ? wtp : `$${wtp}`) : (typeof wtp === 'number' ? `$${wtp.toFixed(0)}` : "Unknown");
  // ---- End of logic from original ProblemSection.tsx ----

  // ---- Logic for newer ProblemValidationSection.tsx style cards ----
  const [expandedSections, setExpandedSections] = useState({ interviews: false, surveys: false });
  const toggleSection = (section: 'interviews' | 'surveys') => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const radarData = [
    { subject: 'Severity', Score: problem_validation?.severity || 0, fullMark: 10 },
    { subject: 'Frequency', Score: problem_validation?.frequency || 0, fullMark: 10 },
    { subject: 'Urgency', Score: problem_validation?.urgency || 0, fullMark: 10 },
    { subject: 'Willingness to Pay', Score: problem_validation?.willingness_to_pay_score || 0, fullMark: 10 },
    { subject: 'Effort to Solve (User)', Score: 10 - (problem_validation?.effort_to_solve || 5), fullMark: 10 }
  ];
  const validationData = [
    { name: 'Interviews', count: interview_insights?.key_quotes?.length || 0 },
    { name: 'Surveys', count: survey_results?.respondents || 0 },
    { name: 'Research', count: problem_validation?.evidence?.length || 0 }
  ];
  // ---- End of logic for newer ProblemValidationSection.tsx ----

  // Choose which UI to render or combine them. For now, focusing on rendering the original ProblemSection UI
  // with the new ProblemValidationSection cards added below it for completeness of mock data.

  return (
    <div className="problem-validation-view"> {/* Using class from the newer ProblemValidationSection for overall container */} 
      <div className="section-header">
        {/* Updated title and subtitle */}
        <h1 className="section-title">Problem Validation: {mockBusinessIdeaName}</h1>
        <p className="section-subtitle">Analysis of the problem for "{mockBusinessIdeaDescription}"</p>
      </div>

      {/* Original ProblemSection Card Structure */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container yellow"><Target className="icon" /></div>
          {/* Updated to use mockProblemStatement */}
          <div><h3 className="card-title">Problem Statement</h3><p className="card-subtitle">Core problem definition for {mockBusinessIdeaName}</p></div>
        </div>
        <div className="card-content">
          <div className="problem-statement"><p className="problem-statement-text">{problem_statement}</p></div>
          {problem_validation.problem_statement_feedback && (
            <div className="feedback-container">
              <h4 className="feedback-title">Feedback on Problem Statement:</h4>
              <p className="feedback-text">{problem_validation.problem_statement_feedback}</p>
            </div>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="card-header"><h3 className="card-title">Problem Validation Metrics</h3><p className="card-subtitle">Quantitative assessment</p></div>
        <div className="card-content">
          <div className="metrics-grid">
            <div className="metrics-column">
              <div className="metric-item">
                <div className="metric-header"><span className="metric-label">Problem Confirmed:</span><div className="metric-value">{problem_validation.exists ? <div className="confirmed-yes"><Check className="check-icon" /><span>Yes</span></div> : <div className="confirmed-no"><AlertTriangle className="alert-icon" /><span>No</span></div>}</div></div>
                <p className="metric-description">Analysis confirms this problem exists.</p>
              </div>
              <div className="metric-item">
                <div className="metric-header"><span className="metric-label">Problem Severity:</span><span className="metric-score" style={{ color: getScoreColor(problem_validation.severity) }}>{problem_validation.severity}/10</span></div>
                <div className="progress-bar-container"><div className="progress-bar" style={{ width: widthPercentage(problem_validation.severity), backgroundColor: getScoreColor(problem_validation.severity) }}></div></div>
                <p className="metric-description">How painful this problem is for users.</p>
              </div>
              <div className="metric-item">
                <div className="metric-header"><span className="metric-label">Problem Frequency:</span><span className="metric-score" style={{ color: getScoreColor(problem_validation.frequency) }}>{problem_validation.frequency}/10</span></div>
                <div className="progress-bar-container"><div className="progress-bar" style={{ width: widthPercentage(problem_validation.frequency), backgroundColor: getScoreColor(problem_validation.frequency) }}></div></div>
                <p className="metric-description">How often users encounter this problem.</p>
              </div>
            </div>
            <div className="metrics-column">
              <div className="metric-item">
                <div className="metric-header"><span className="metric-label">Willingness to Pay:</span><span className="wtp-value">{formatWTP(problem_validation.willingness_to_pay_text)}</span></div>
                <div className="wtp-container"><DollarSign className="wtp-icon" /><p>{problem_validation.willingness_to_pay_text}</p></div>
              </div>
              <div className="metric-item">
                <div className="metric-header"><span className="metric-label">Confidence Level:</span><span className="confidence-value">{problem_validation.confidence_level}/10</span></div>
                <div className="progress-bar-container"><div className="progress-bar confidence" style={{ width: widthPercentage(problem_validation.confidence_level) }}></div></div>
                <p className="metric-description">Based on quantity and quality of evidence.</p>
              </div>
              <div className="opportunity-container"><Clock className="opportunity-icon" /><p>Represents a <span className="opportunity-highlight">significant opportunity</span>.</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header"><h3 className="card-title">Supporting Evidence</h3><p className="card-subtitle">Research findings validating the problem</p></div>
        <div className="evidence-list">
          {problem_validation.evidence.map((ev, index) => (
            <div key={index} className="evidence-item">
              <div className="evidence-content">
                <div className="evidence-icon-container">{getEvidenceIcon(ev.type)}</div>
                <div className="evidence-details">
                  <div className="evidence-header"><h4 className="evidence-source">{ev.source}</h4><div className="evidence-meta"><span className="evidence-date">{ev.date}</span><span className="evidence-type">{ev.type}</span></div></div>
                  <div className="evidence-quotes">{ev.quotes.map((q, qi) => (<div key={qi} className="evidence-quote"><p className="quote-text">{q}</p></div>))}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="card-header"><h3 className="card-title">Alternative Solutions</h3><p className="card-subtitle">How people currently solve this problem</p></div>
        <div className="card-content">
          <div className="solutions-grid">
            {problem_validation.alternative_solutions.map((sol, index) => (
              <div key={index} className="solution-item">
                <div className="solution-header"><h4 className="solution-name">{sol.name}</h4></div>
                <div className="solution-details">
                  <h5 className="solution-section-title">Approach:</h5><p className="solution-approach">{sol.approach}</p>
                  <h5 className="solution-section-title">Limitations:</h5><div className="solution-limitations"><AlertTriangle className="limitations-icon" /><p className="limitations-text">{sol.limitations}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Cards from ProblemValidationSection (new style) */}
      {/* These use `interview_insights`, `survey_results`, etc. from mockProblemData */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container blue"><Info className="icon" /></div>
          <div><h3 className="card-title">Problem Metrics (Radar)</h3><p className="card-subtitle">Key indicators of problem significance</p></div>
        </div>
        <div className="card-content">
          <div className="metrics-grid">
            <div className="metrics-chart">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis domain={[0, 10]} />
                  <Radar name="Score" dataKey="Score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Legend /><Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="metrics-details">
                {radarData.map(metric => (
                    <div key={metric.subject} className="metric-item" style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom:'10px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}><strong>{metric.subject}</strong> <span>{metric.Score}/10</span></div>
                    </div>
                ))}
            </div>
          </div>
          <div className="validation-methods">
            <h4 className="methods-title">Validation Methods Used</h4>
            <div className="methods-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={validationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis />
                  <Tooltip /><Legend />
                  <Bar dataKey="count" name="Count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {interview_insights && (
          <div className="section-card">
            <div className="card-header clickable" onClick={() => toggleSection('interviews')}>
              <div className="header-content">
                <div className="icon-container green"><MessageCircle className="icon" /></div>
                <div><h3 className="card-title">Interview Insights</h3><p className="card-subtitle">Key findings from customer interviews ({interview_insights.key_quotes?.length || 0} quotes)</p></div>
              </div>
              <div className="toggle-icon">{expandedSections.interviews ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}</div>
            </div>
            {expandedSections.interviews && (
              <div className="card-content">
                <div className="interview-summary">
                    <h4 className="summary-subtitle">Summary of Findings:</h4> 
                    <p className="summary-description">{interview_insights.summary}</p>
                    {interview_insights.key_quotes && interview_insights.key_quotes.length > 0 && (
                        <div className="key-quotes">
                            <h4 className="quotes-title">Key Quotes:</h4>
                            <div className="quotes-list">
                                {interview_insights.key_quotes.map((q,i)=>(<div key={i} className="quote-item"><div className="quote-mark">"</div><p className="quote-text">{q}</p></div>))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="interview-findings">
                    <h4 className="findings-title">Detailed Findings:</h4>
                    <div className="findings-grid">
                        <div className="finding-column">
                            <div className="finding-header"><Check className="check-icon" /><h5 className="finding-subtitle">Confirmed Assumptions</h5></div>
                            <ul className="findings-list">{interview_insights.confirmed_assumptions?.map((item, i) => <li key={i}>{item}</li>) || <li className="no-data-item">N/A</li>}</ul>
                        </div>
                        <div className="finding-column">
                            <div className="finding-header"><LucideX className="x-icon" /><h5 className="finding-subtitle">Invalidated Assumptions</h5></div>
                            <ul className="findings-list">{interview_insights.invalidated_assumptions?.map((item, i) => <li key={i}>{item}</li>) || <li className="no-data-item">N/A</li>}</ul>
                        </div>
                        <div className="finding-column">
                            <div className="finding-header"><AlertTriangle className="alert-icon" /><h5 className="finding-subtitle">Key Pain Points</h5></div>
                            <ul className="findings-list">{interview_insights.key_pain_points?.map((item, i) => <li key={i}>{item}</li>) || <li className="no-data-item">N/A</li>}</ul>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
      )}
      {survey_results && (
          <div className="section-card">
            <div className="card-header clickable" onClick={() => toggleSection('surveys')}>
              <div className="header-content">
                <div className="icon-container purple"><Edit className="icon" /></div>
                <div><h3 className="card-title">Survey Results</h3><p className="card-subtitle">Quantitative validation ({survey_results.respondents} respondents)</p></div>
              </div>
              <div className="toggle-icon">{expandedSections.surveys ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}</div>
            </div>
            {expandedSections.surveys && (
              <div className="card-content">
                <div className="survey-overview">
                    <h4 className="overview-title">Survey Overview</h4>
                    <div className="overview-stats">
                        <div className="stat-item"><div className="stat-value">{survey_results.respondents}</div><div className="stat-label">Respondents</div></div>
                        <div className="stat-item"><div className="stat-value">{survey_results.completion_rate}</div><div className="stat-label">Completion Rate</div></div>
                        <div className="stat-item"><div className="stat-value">{survey_results.target_segments_reached}</div><div className="stat-label">Target Segments Reached</div></div>
                    </div>
                </div>
                <div className="survey-findings">
                    <h4 className="findings-title">Key Findings</h4>
                    <div className="key-metrics">
                        <div className="key-metric"><div className="metric-label">Problem Experience</div><div className="metric-value-large">{survey_results.problem_experience_rate}</div></div>
                        <div className="key-metric"><div className="metric-label">Solution Satisfaction</div><div className="metric-value-large">{survey_results.current_solution_satisfaction}</div></div>
                        <div className="key-metric"><div className="metric-label">Interest in New Solution</div><div className="metric-value-large">{survey_results.interest_in_new_solution}</div></div>
                    </div>
                    {survey_results.willingness_to_pay && (
                        <div className="payment-insights">
                            <h4 className="payment-title">Willingness to Pay</h4>
                            <div className="payment-metrics">
                                <div className="payment-metric"><DollarSign className="payment-icon" /><div className="payment-info"><div className="payment-label">Average</div><div className="payment-value">{survey_results.willingness_to_pay.average}</div></div></div>
                                <div className="payment-metric"><Clock className="payment-icon" /><div className="payment-info"><div className="payment-label">Frequency</div><div className="payment-value">{survey_results.willingness_to_pay.frequency}</div></div></div>
                                <div className="payment-metric"><DollarSign className="payment-icon" /><div className="payment-info"><div className="payment-label">Range</div><div className="payment-value">{survey_results.willingness_to_pay.range}</div></div></div>
                            </div>
                        </div>
                    )}
                    {survey_results.feature_priorities && survey_results.feature_priorities.length > 0 && (
                        <div className="feature-priorities">
                            <h4 className="priorities-title">Top Feature Priorities:</h4>
                            <div className="priorities-list">
                                {survey_results.feature_priorities.map((feature, index) => (
                                    <div key={index} className="priority-item"><div className="priority-rank">{index+1}</div><div className="priority-details"><div className="priority-name">{feature.name}</div><div className="priority-score">Score: {feature.score}/10</div></div></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
      )}
    </div>
  );
};

export default ProblemSectionMock; 