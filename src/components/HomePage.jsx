import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 3D Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        if (this.z < 0 || this.z > 1000) this.vz *= -1;
      }

      draw() {
        const scale = 1000 / (1000 + this.z);
        const x2d = this.x * scale + canvas.width / 2 * (1 - scale);
        const y2d = this.y * scale + canvas.height / 2 * (1 - scale);
        const r = this.radius * scale;

        ctx.beginPath();
        ctx.arc(x2d, y2d, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${this.opacity * scale})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.fillStyle = 'rgba(5, 10, 5, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const features = [
    {
      icon: '🎯',
      title: 'AI-Powered Precision',
      description: 'Advanced computer vision analyzes crop images with 95%+ accuracy, detecting diseases before visible to human eye'
    },
    {
      icon: '🌍',
      title: 'Native Language Support',
      description: 'Voice-first interface in 15+ languages with icon-based workflows for low-literacy farmers'
    },
    {
      icon: '📡',
      title: 'Offline-First Design',
      description: 'Core functionality works without internet - critical for rural areas with poor connectivity'
    },
    {
      icon: '🔒',
      title: 'Privacy-Preserving AI',
      description: 'Federated learning protects farmer data while continuously improving diagnostic models'
    },
    {
      icon: '💊',
      title: 'Complete Treatment Plans',
      description: 'Step-by-step organic & chemical remediation with dosage, safety warnings, and prevention tips'
    },
    {
      icon: '🌾',
      title: 'Regional Intelligence',
      description: 'Context-aware recommendations based on local climate, soil, and agronomic practices'
    }
  ];

  const techStack = [
    { name: 'React.js', color: '#61DAFB' },
    { name: 'Node.js', color: '#339933' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Express.js', color: '#000000' },
    { name: 'Python ML', color: '#3776AB' },
    { name: 'TensorFlow', color: '#FF6F00' }
  ];

  const uniqueness = [
    {
      title: 'Holistic Approach',
      desc: 'Beyond disease labeling - complete decision support from detection to treatment to prevention'
    },
    {
      title: 'True Accessibility',
      desc: 'Designed for farmers with minimal education - not just translated, but reimagined for rural users'
    },
    {
      title: 'Community-Centric',
      desc: 'Connects farmers with local experts and peers, creating knowledge networks beyond individual diagnosis'
    },
    {
      title: 'Cost-Conscious',
      desc: 'Prioritizes affordable, locally available treatments - understanding economic constraints'
    }
  ];

  return (
    <div className="landing-container">
      {/* Progress Bar */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* 3D Background Canvas */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="floating-badge">
            <span className="pulse-dot"></span>
            AI-Powered Agriculture
          </div>

          <h1 className="hero-title">
            <span className="title-line">CropAId</span>
            <span className="title-subtitle">Smart Treatment Starts Here</span>
          </h1>

          <p className="hero-description">
            Empowering farmers with intelligent crop disease diagnosis and actionable remediation
            guidance through AI-driven insights, native language support, and offline-first accessibility.
          </p>

          <div className="cta-group">
            <button
              className="cta-primary"
              onClick={() => navigate('/home')}
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
              }}
            >
              <span className="cta-text">Launch Application</span>
              <span className="cta-arrow">→</span>
            </button>

            <button className="cta-secondary">
              <span>Watch Demo</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">95%+</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Languages</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Offline Access</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">🌱</div>
            <div className="card-text">Disease Detected</div>
            <div className="card-confidence">Confidence: 96%</div>
          </div>

          <div className="floating-card card-2">
            <div className="card-icon">💊</div>
            <div className="card-text">Treatment Ready</div>
            <div className="card-confidence">3 Options Available</div>
          </div>

          <div className="floating-card card-3">
            <div className="card-icon">📊</div>
            <div className="card-text">Risk Analysis</div>
            <div className="card-confidence">Severity: Moderate</div>
          </div>

          <div className="crop-circle">
            <div className="crop-ring ring-1"></div>
            <div className="crop-ring ring-2"></div>
            <div className="crop-ring ring-3"></div>
            <div className="crop-icon">🌾</div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="problem-section">
        <div className="section-header">
          <span className="section-tag">The Challenge</span>
          <h2 className="section-title">
            The Real-World Crisis
          </h2>
        </div>

        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon">⏱️</div>
            <h3>Delayed Detection</h3>
            <p>Traditional methods rely on slow manual inspection or expert visits, leading to severe yield loss</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">🌐</div>
            <h3>Limited Access</h3>
            <p>Smallholder farmers lack access to expert guidance and digital tools for timely intervention</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">📱</div>
            <h3>Connectivity Issues</h3>
            <p>Unreliable internet in rural areas restricts access to real-time agricultural support systems</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">📖</div>
            <h3>Literacy Barriers</h3>
            <p>Text-based advisory systems fail to reach farmers with low literacy and language constraints</p>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section className="solution-section">
        <div className="solution-content">
          <div className="solution-text">
            <span className="section-tag">Our Innovation</span>
            <h2 className="section-title">Intelligent Decision Support</h2>
            <p className="solution-description">
              CropAId transforms crop disease management by combining state-of-the-art computer vision
              with agronomic intelligence. Our system doesn't just identify diseases - it provides complete
              decision support from early detection through treatment to prevention, all accessible to
              farmers regardless of literacy level or internet connectivity.
            </p>

            <div className="solution-points">
              <div className="point-item">
                <div className="point-icon">✓</div>
                <div>
                  <strong>Image & Video Analysis:</strong> Upload photos or short videos for instant AI-powered diagnosis
                </div>
              </div>
              <div className="point-item">
                <div className="point-icon">✓</div>
                <div>
                  <strong>Severity Estimation:</strong> Understand disease progression with confidence indicators
                </div>
              </div>
              <div className="point-item">
                <div className="point-icon">✓</div>
                <div>
                  <strong>Region-Specific Guidance:</strong> Tailored recommendations based on local practices and climate
                </div>
              </div>
              <div className="point-item">
                <div className="point-icon">✓</div>
                <div>
                  <strong>Voice-First Interface:</strong> Native language support with audio instructions and icon-based workflows
                </div>
              </div>
            </div>
          </div>

          <div className="solution-visual">
            <div className="workflow-diagram">
              <div className="workflow-step step-1">
                <div className="step-number">1</div>
                <div className="step-label">Capture</div>
              </div>
              <div className="workflow-arrow">→</div>
              <div className="workflow-step step-2">
                <div className="step-number">2</div>
                <div className="step-label">Analyze</div>
              </div>
              <div className="workflow-arrow">→</div>
              <div className="workflow-step step-3">
                <div className="step-number">3</div>
                <div className="step-label">Diagnose</div>
              </div>
              <div className="workflow-arrow">→</div>
              <div className="workflow-step step-4">
                <div className="step-number">4</div>
                <div className="step-label">Treat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Capabilities</span>
          <h2 className="section-title">Powerful Features</h2>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-shine"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Uniqueness Section */}
      <section className="uniqueness-section">
        <div className="section-header">
          <span className="section-tag">What Sets Us Apart</span>
          <h2 className="section-title">Why CropAId is Different</h2>
        </div>

        <div className="uniqueness-grid">
          {uniqueness.map((item, index) => (
            <div key={index} className="uniqueness-card">
              <div className="uniqueness-number">0{index + 1}</div>
              <h3 className="uniqueness-title">{item.title}</h3>
              <p className="uniqueness-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <div className="section-header">
          <span className="section-tag">Built With</span>
          <h2 className="section-title">Modern Technology Stack</h2>
        </div>

        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="tech-card"
              style={{
                '--tech-color': tech.color,
                animationDelay: `${index * 0.15}s`
              }}
            >
              <div className="tech-glow" style={{ backgroundColor: tech.color }}></div>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>

        <div className="tech-architecture">
          <div className="arch-layer">
            <div className="arch-label">Frontend</div>
            <div className="arch-tech">React.js • HTML5 • CSS3</div>
          </div>
          <div className="arch-connector"></div>
          <div className="arch-layer">
            <div className="arch-label">Backend</div>
            <div className="arch-tech">Node.js • Express.js • RESTful APIs</div>
          </div>
          <div className="arch-connector"></div>
          <div className="arch-layer">
            <div className="arch-label">Database</div>
            <div className="arch-tech">MongoDB • Cloud Storage</div>
          </div>
          <div className="arch-connector"></div>
          <div className="arch-layer">
            <div className="arch-label">AI/ML</div>
            <div className="arch-tech">Python • TensorFlow • Computer Vision</div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="impact-content">
          <span className="section-tag">Real-World Impact</span>
          <h2 className="section-title">Transforming Agriculture</h2>

          <div className="impact-metrics">
            <div className="metric-card">
              <div className="metric-icon">🌾</div>
              <div className="metric-value">Early Detection</div>
              <div className="metric-label">Prevents crop loss before visible symptoms</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">Cost Reduction</div>
              <div className="metric-label">Optimized treatment reduces chemical waste</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🌱</div>
              <div className="metric-value">Sustainable Farming</div>
              <div className="metric-label">Promotes organic alternatives and prevention</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👨‍🌾</div>
              <div className="metric-value">Farmer Empowerment</div>
              <div className="metric-label">Independent decision-making with expert support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Farming?</h2>
          <p className="cta-description">
            Join thousands of farmers using AI to protect their crops and increase yields
          </p>

          <button
            className="cta-launch"
            onClick={() => navigate('/home')}
          >
            <span className="launch-text">Launch CropAId</span>
            <span className="launch-icon">🚀</span>
          </button>

          <div className="cta-info">
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>Free to use</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>No internet required</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>Available in 15+ languages</span>
            </div>
          </div>
        </div>

        <div className="cta-background">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>CropAId</h3>
            <p>Smart Treatment Starts Here</p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#tech">Technology</a>
              <a href="#impact">Impact</a>
            </div>

            <div className="link-group">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#research">Research</a>
              <a href="#support">Support</a>
            </div>

            <div className="link-group">
              <h4>Team</h4>
              <a href="https://github.com/Akshith1413/SWE_AI_CROP" target="_blank" rel="noopener noreferrer">Frontend Repo</a>
              <a href="https://github.com/Akshith1413/SWE_AI_CROP_BACK" target="_blank" rel="noopener noreferrer">Backend Repo</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 CropAId - Team 7 • Built with ❤️ for Farmers</p>
          <p className="footer-course">Software Engineering Project • Amrita Vishwa Vidyapeetham</p>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-container {
          background: linear-gradient(135deg, #0a0f0a 0%, #0d1b0d 50%, #0a0f0a 100%);
          color: #e0ffe0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* Progress Bar */
        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #4ade80, #22c55e);
          transition: width 0.1s ease;
          z-index: 9999;
          box-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
        }

        /* Particle Canvas */
        .particle-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 120px 80px 80px;
          position: relative;
          z-index: 1;
          gap: 60px;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .floating-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
          color: #4ade80;
          margin-bottom: 30px;
          animation: float 3s ease-in-out infinite;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .hero-title {
          font-size: 72px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }

        .title-line {
          display: block;
          background: linear-gradient(135deg, #4ade80, #22c55e, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .title-subtitle {
          display: block;
          font-size: 28px;
          font-weight: 500;
          color: rgba(224, 255, 224, 0.7);
          margin-top: 10px;
          letter-spacing: 1px;
        }

        .hero-description {
          font-size: 18px;
          line-height: 1.7;
          color: rgba(224, 255, 224, 0.8);
          margin-bottom: 40px;
          max-width: 540px;
        }

        .cta-group {
          display: flex;
          gap: 20px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }

        .cta-primary {
          padding: 18px 40px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #0a0f0a;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 40px rgba(74, 222, 128, 0.3);
          transform-style: preserve-3d;
        }

        .cta-primary:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(74, 222, 128, 0.5);
        }

        .cta-arrow {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .cta-primary:hover .cta-arrow {
          transform: translateX(5px);
        }

        .cta-secondary {
          padding: 18px 35px;
          background: transparent;
          border: 2px solid rgba(74, 222, 128, 0.4);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #4ade80;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .cta-secondary:hover {
          background: rgba(74, 222, 128, 0.1);
          border-color: #4ade80;
          transform: translateY(-2px);
        }

        .hero-stats {
          display: flex;
          gap: 30px;
          align-items: center;
          padding: 25px 0;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #4ade80;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 13px;
          color: rgba(224, 255, 224, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(74, 222, 128, 0.3);
        }

        /* Hero Visual */
        .hero-visual {
          flex: 1;
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-card {
          position: absolute;
          padding: 20px 25px;
          background: rgba(15, 30, 15, 0.8);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: cardFloat 4s ease-in-out infinite;
        }

        .card-1 {
          top: 50px;
          left: 50px;
          animation-delay: 0s;
        }

        .card-2 {
          top: 200px;
          right: 80px;
          animation-delay: 1s;
        }

        .card-3 {
          bottom: 100px;
          left: 80px;
          animation-delay: 2s;
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        .card-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .card-text {
          font-size: 14px;
          font-weight: 600;
          color: #e0ffe0;
          margin-bottom: 4px;
        }

        .card-confidence {
          font-size: 12px;
          color: #4ade80;
        }

        .crop-circle {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crop-ring {
          position: absolute;
          border: 2px solid rgba(74, 222, 128, 0.2);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        .ring-1 {
          width: 100%;
          height: 100%;
          border-top-color: #4ade80;
          animation-duration: 15s;
        }

        .ring-2 {
          width: 75%;
          height: 75%;
          border-right-color: #22c55e;
          animation-duration: 20s;
          animation-direction: reverse;
        }

        .ring-3 {
          width: 50%;
          height: 50%;
          border-bottom-color: #16a34a;
          animation-duration: 25s;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .crop-icon {
          font-size: 80px;
          animation: pulse 3s ease-in-out infinite;
        }

        /* Problem Section */
        .problem-section {
          padding: 100px 80px;
          position: relative;
          z-index: 1;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-tag {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 48px;
          font-weight: 700;
          color: #e0ffe0;
          letter-spacing: -1px;
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .problem-card {
          padding: 35px;
          background: rgba(15, 30, 15, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .problem-card:hover {
          transform: translateY(-10px);
          border-color: rgba(74, 222, 128, 0.5);
          box-shadow: 0 20px 60px rgba(74, 222, 128, 0.2);
        }

        .problem-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .problem-card h3 {
          font-size: 22px;
          font-weight: 600;
          color: #4ade80;
          margin-bottom: 12px;
        }

        .problem-card p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(224, 255, 224, 0.7);
        }

        /* Solution Section */
        .solution-section {
          padding: 100px 80px;
          background: rgba(74, 222, 128, 0.03);
          position: relative;
          z-index: 1;
        }

        .solution-content {
          display: flex;
          gap: 80px;
          align-items: center;
        }

        .solution-text {
          flex: 1;
        }

        .solution-description {
          font-size: 17px;
          line-height: 1.8;
          color: rgba(224, 255, 224, 0.8);
          margin-bottom: 40px;
        }

        .solution-points {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .point-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 15px;
          background: rgba(74, 222, 128, 0.05);
          border-radius: 12px;
          border-left: 3px solid #4ade80;
        }

        .point-icon {
          width: 24px;
          height: 24px;
          background: #4ade80;
          color: #0a0f0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .point-item strong {
          color: #4ade80;
        }

        .solution-visual {
          flex: 1;
        }

        .workflow-diagram {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          padding: 40px;
          background: rgba(15, 30, 15, 0.6);
          border-radius: 20px;
          border: 1px solid rgba(74, 222, 128, 0.2);
        }

        .workflow-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          animation: stepPulse 2s ease-in-out infinite;
        }

        .step-1 { animation-delay: 0s; }
        .step-2 { animation-delay: 0.5s; }
        .step-3 { animation-delay: 1s; }
        .step-4 { animation-delay: 1.5s; }

        @keyframes stepPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #0a0f0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3);
        }

        .step-label {
          font-size: 14px;
          font-weight: 600;
          color: #e0ffe0;
        }

        .workflow-arrow {
          font-size: 32px;
          color: #4ade80;
          animation: arrowSlide 1.5s ease-in-out infinite;
        }

        @keyframes arrowSlide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        /* Features Section */
        .features-section {
          padding: 100px 80px;
          position: relative;
          z-index: 1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .feature-card {
          padding: 40px;
          background: linear-gradient(135deg, rgba(15, 30, 15, 0.8), rgba(10, 25, 10, 0.6));
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 20px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(74, 222, 128, 0.5);
          box-shadow: 0 20px 60px rgba(74, 222, 128, 0.2);
        }

        .feature-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .feature-card:hover .feature-shine {
          left: 100%;
        }

        .feature-icon {
          font-size: 56px;
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 22px;
          font-weight: 600;
          color: #4ade80;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(224, 255, 224, 0.7);
        }

        /* Uniqueness Section */
        .uniqueness-section {
          padding: 100px 80px;
          background: rgba(74, 222, 128, 0.03);
          position: relative;
          z-index: 1;
        }

        .uniqueness-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .uniqueness-card {
          padding: 35px;
          background: rgba(15, 30, 15, 0.6);
          border-left: 4px solid #4ade80;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .uniqueness-card:hover {
          transform: translateX(10px);
          background: rgba(15, 30, 15, 0.8);
        }

        .uniqueness-number {
          font-size: 48px;
          font-weight: 700;
          color: rgba(74, 222, 128, 0.3);
          margin-bottom: 15px;
        }

        .uniqueness-title {
          font-size: 20px;
          font-weight: 600;
          color: #4ade80;
          margin-bottom: 10px;
        }

        .uniqueness-desc {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(224, 255, 224, 0.7);
        }

        /* Tech Section */
        .tech-section {
          padding: 100px 80px;
          position: relative;
          z-index: 1;
        }

        .tech-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          margin-bottom: 60px;
        }

        .tech-card {
          padding: 20px 35px;
          background: rgba(15, 30, 15, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease backwards;
        }

        .tech-card:hover {
          transform: translateY(-5px);
          border-color: var(--tech-color);
          box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3);
        }

        .tech-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tech-card:hover .tech-glow {
          opacity: 0.3;
        }

        .tech-name {
          font-size: 16px;
          font-weight: 600;
          color: #e0ffe0;
          position: relative;
          z-index: 1;
        }

        .tech-architecture {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .arch-layer {
          padding: 25px;
          background: rgba(15, 30, 15, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 12px;
          text-align: center;
        }

        .arch-label {
          font-size: 14px;
          font-weight: 600;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .arch-tech {
          font-size: 15px;
          color: rgba(224, 255, 224, 0.7);
        }

        .arch-connector {
          height: 30px;
          width: 2px;
          background: linear-gradient(180deg, rgba(74, 222, 128, 0.5), rgba(74, 222, 128, 0.2));
          margin: 0 auto;
        }

        /* Impact Section */
        .impact-section {
          padding: 100px 80px;
          background: rgba(74, 222, 128, 0.03);
          position: relative;
          z-index: 1;
        }

        .impact-content {
          text-align: center;
        }

        .impact-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .metric-card {
          padding: 40px;
          background: rgba(15, 30, 15, 0.6);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-10px);
          border-color: rgba(74, 222, 128, 0.5);
          box-shadow: 0 20px 60px rgba(74, 222, 128, 0.2);
        }

        .metric-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #4ade80;
          margin-bottom: 10px;
        }

        .metric-label {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(224, 255, 224, 0.7);
        }

        /* Final CTA */
        .final-cta {
          padding: 120px 80px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-title {
          font-size: 56px;
          font-weight: 700;
          color: #e0ffe0;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }

        .cta-description {
          font-size: 20px;
          color: rgba(224, 255, 224, 0.7);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-launch {
          padding: 24px 60px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border: none;
          border-radius: 16px;
          font-size: 20px;
          font-weight: 700;
          color: #0a0f0a;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 20px 60px rgba(74, 222, 128, 0.4);
          margin-bottom: 30px;
        }

        .cta-launch:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 30px 80px rgba(74, 222, 128, 0.6);
        }

        .launch-icon {
          font-size: 28px;
        }

        .cta-info {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: rgba(224, 255, 224, 0.8);
        }

        .info-icon {
          color: #4ade80;
          font-weight: 700;
        }

        .cta-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
        }

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.1), transparent);
          animation: circleFloat 20s ease-in-out infinite;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          bottom: -50px;
          right: -50px;
          animation-delay: 5s;
        }

        .circle-3 {
          width: 500px;
          height: 500px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes circleFloat {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-30px, 30px); }
        }

        /* Footer */
        .footer {
          background: rgba(5, 10, 5, 0.8);
          border-top: 1px solid rgba(74, 222, 128, 0.2);
          padding: 60px 80px 30px;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          gap: 60px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .footer-brand h3 {
          font-size: 28px;
          color: #4ade80;
          margin-bottom: 10px;
        }

        .footer-brand p {
          color: rgba(224, 255, 224, 0.6);
          font-size: 14px;
        }

        .footer-links {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
        }

        .link-group h4 {
          font-size: 14px;
          color: #4ade80;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .link-group a {
          display: block;
          color: rgba(224, 255, 224, 0.7);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 10px;
          transition: color 0.3s ease;
        }

        .link-group a:hover {
          color: #4ade80;
        }

        .footer-bottom {
          padding-top: 30px;
          border-top: 1px solid rgba(74, 222, 128, 0.1);
          text-align: center;
        }

        .footer-bottom p {
          font-size: 13px;
          color: rgba(224, 255, 224, 0.5);
          margin-bottom: 5px;
        }

        .footer-course {
          font-size: 12px;
          color: rgba(74, 222, 128, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-section {
            padding: 100px 60px 60px;
          }

          .problem-section, .solution-section, .features-section,
          .uniqueness-section, .tech-section, .impact-section,
          .final-cta, .footer {
            padding-left: 60px;
            padding-right: 60px;
          }
        }

        @media (max-width: 968px) {
          .hero-section {
            flex-direction: column;
            gap: 40px;
          }

          .hero-visual {
            height: 400px;
          }

          .hero-title {
            font-size: 56px;
          }

          .solution-content {
            flex-direction: column;
            gap: 40px;
          }

          .footer-content {
            flex-direction: column;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .hero-section, .problem-section, .solution-section,
          .features-section, .uniqueness-section, .tech-section,
          .impact-section, .final-cta, .footer {
            padding: 80px 30px 60px;
          }

          .hero-title {
            font-size: 42px;
          }

          .title-subtitle {
            font-size: 22px;
          }

          .section-title {
            font-size: 36px;
          }

          .cta-title {
            font-size: 42px;
          }

          .cta-group {
            flex-direction: column;
          }

          .cta-primary, .cta-secondary {
            width: 100%;
            justify-content: center;
          }

          .workflow-diagram {
            flex-direction: column;
          }

          .workflow-arrow {
            transform: rotate(90deg);
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 36px;
          }

          .section-title {
            font-size: 28px;
          }

          .hero-stats {
            flex-direction: column;
            gap: 20px;
          }

          .stat-divider {
            display: none;
          }

          .floating-card {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;