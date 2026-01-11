#!/usr/bin/env python3
"""
Comprehensive test runner for IP Management System.

Runs all test suites with coverage reporting and generates live test reports
for monitoring test results in real-time.
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path
from typing import List, Dict, Any
import json


class TestRunner:
    """Advanced test runner with live reporting capabilities."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.reports_dir = self.project_root / "reports"
        self.reports_dir.mkdir(exist_ok=True)
        
    def run_backend_tests(self) -> Dict[str, Any]:
        """Run backend Python tests with coverage."""
        print("🧪 Running Backend Tests...")
        print("=" * 50)
        
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/test_domain_service.py",
            "tests/test_vlan_service.py", 
            "tests/test_ip_calculator.py",
            "tests/test_api_endpoints.py",
            "--cov=src/ip_management",
            "--cov-report=html:reports/backend_coverage",
            "--cov-report=term-missing",
            "--html=reports/backend_tests.html",
            "--self-contained-html",
            "--junitxml=reports/backend_junit.xml",
            "-v"
        ]
        
        start_time = time.time()
        result = subprocess.run(cmd, cwd=self.project_root, capture_output=True, text=True)
        end_time = time.time()
        
        return {
            "name": "Backend Tests",
            "success": result.returncode == 0,
            "duration": end_time - start_time,
            "output": result.stdout,
            "errors": result.stderr,
            "report_path": "reports/backend_tests.html"
        }
    
    def run_frontend_tests(self) -> Dict[str, Any]:
        """Run frontend tests with Playwright."""
        print("🎭 Running Frontend Tests...")
        print("=" * 50)
        
        # Install Playwright browsers if needed
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], 
                      cwd=self.project_root, capture_output=True)
        
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/test_frontend_components.py",
            "--html=reports/frontend_tests.html",
            "--self-contained-html",
            "--junitxml=reports/frontend_junit.xml",
            "-v"
        ]
        
        start_time = time.time()
        result = subprocess.run(cmd, cwd=self.project_root, capture_output=True, text=True)
        end_time = time.time()
        
        return {
            "name": "Frontend Tests",
            "success": result.returncode == 0,
            "duration": end_time - start_time,
            "output": result.stdout,
            "errors": result.stderr,
            "report_path": "reports/frontend_tests.html"
        }
    
    def run_performance_tests(self) -> Dict[str, Any]:
        """Run performance tests to validate <1s requirements."""
        print("⚡ Running Performance Tests...")
        print("=" * 50)
        
        cmd = [
            sys.executable, "-m", "pytest",
            "-m", "performance",
            "--html=reports/performance_tests.html",
            "--self-contained-html",
            "--junitxml=reports/performance_junit.xml",
            "-v"
        ]
        
        start_time = time.time()
        result = subprocess.run(cmd, cwd=self.project_root, capture_output=True, text=True)
        end_time = time.time()
        
        return {
            "name": "Performance Tests",
            "success": result.returncode == 0,
            "duration": end_time - start_time,
            "output": result.stdout,
            "errors": result.stderr,
            "report_path": "reports/performance_tests.html"
        }
    
    def run_security_tests(self) -> Dict[str, Any]:
        """Run security and validation tests."""
        print("🔒 Running Security Tests...")
        print("=" * 50)
        
        cmd = [
            sys.executable, "-m", "pytest",
            "-m", "security",
            "--html=reports/security_tests.html",
            "--self-contained-html",
            "--junitxml=reports/security_junit.xml",
            "-v"
        ]
        
        start_time = time.time()
        result = subprocess.run(cmd, cwd=self.project_root, capture_output=True, text=True)
        end_time = time.time()
        
        return {
            "name": "Security Tests",
            "success": result.returncode == 0,
            "duration": end_time - start_time,
            "output": result.stdout,
            "errors": result.stderr,
            "report_path": "reports/security_tests.html"
        }
    
    def generate_summary_report(self, results: List[Dict[str, Any]]) -> str:
        """Generate comprehensive HTML summary report."""
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r["success"])
        total_duration = sum(r["duration"] for r in results)
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Management System - Test Results</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}
        .metric {{
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }}
        .metric-value {{
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .metric-label {{
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .success {{ color: #27ae60; }}
        .failure {{ color: #e74c3c; }}
        .warning {{ color: #f39c12; }}
        .results {{
            padding: 30px;
        }}
        .test-suite {{
            margin-bottom: 30px;
            border: 1px solid #e1e8ed;
            border-radius: 10px;
            overflow: hidden;
        }}
        .suite-header {{
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e1e8ed;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .suite-name {{
            font-size: 1.3em;
            font-weight: 600;
        }}
        .suite-status {{
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-weight: 500;
            font-size: 0.9em;
        }}
        .suite-details {{
            padding: 20px;
        }}
        .duration {{
            color: #666;
            font-size: 0.9em;
        }}
        .links {{
            margin-top: 15px;
        }}
        .links a {{
            display: inline-block;
            margin-right: 15px;
            padding: 8px 16px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 0.9em;
            transition: background 0.3s;
        }}
        .links a:hover {{
            background: #2980b9;
        }}
        .footer {{
            text-align: center;
            padding: 30px;
            background: #2c3e50;
            color: white;
        }}
        .timestamp {{
            opacity: 0.7;
            font-size: 0.9em;
        }}
        @media (max-width: 768px) {{
            .summary {{
                grid-template-columns: repeat(2, 1fr);
            }}
            .suite-header {{
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏭 IP Management System</h1>
            <p>Bosch Rexroth Bursa Factory - Test Results Dashboard</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value {'success' if passed_tests == total_tests else 'failure'}">{passed_tests}/{total_tests}</div>
                <div class="metric-label">Test Suites Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value {'success' if total_duration < 30 else 'warning'}">{total_duration:.1f}s</div>
                <div class="metric-label">Total Duration</div>
            </div>
            <div class="metric">
                <div class="metric-value success">{(passed_tests/total_tests*100):.1f}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value {'success' if passed_tests == total_tests else 'failure'}">{'✅ PASS' if passed_tests == total_tests else '❌ FAIL'}</div>
                <div class="metric-label">Overall Status</div>
            </div>
        </div>
        
        <div class="results">
            <h2>Test Suite Results</h2>
        """
        
        for result in results:
            status_class = "success" if result["success"] else "failure"
            status_text = "✅ PASSED" if result["success"] else "❌ FAILED"
            
            html_content += f"""
            <div class="test-suite">
                <div class="suite-header">
                    <div class="suite-name">{result['name']}</div>
                    <div class="suite-status" style="background: {'#27ae60' if result['success'] else '#e74c3c'}">{status_text}</div>
                </div>
                <div class="suite-details">
                    <div class="duration">Duration: {result['duration']:.2f} seconds</div>
                    <div class="links">
                        <a href="{result['report_path']}" target="_blank">📊 Detailed Report</a>
                        <a href="#" onclick="toggleOutput('{result['name'].replace(' ', '_')}')">📝 View Output</a>
                    </div>
                    <div id="output_{result['name'].replace(' ', '_')}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 5px; font-family: monospace; font-size: 0.8em; white-space: pre-wrap;">{result['output']}</div>
                </div>
            </div>
            """
        
        html_content += f"""
        </div>
        
        <div class="footer">
            <div class="timestamp">Generated on {time.strftime('%Y-%m-%d %H:%M:%S')}</div>
            <p>🔧 Industrial IT/OT Network Management System</p>
        </div>
    </div>
    
    <script>
        function toggleOutput(testName) {{
            const element = document.getElementById('output_' + testName);
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }}
        
        // Auto-refresh every 30 seconds if tests are running
        setTimeout(() => {{
            window.location.reload();
        }}, 30000);
    </script>
</body>
</html>
        """
        
        report_path = self.reports_dir / "test_summary.html"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        
        return str(report_path)
    
    def run_all_tests(self) -> None:
        """Run all test suites and generate comprehensive report."""
        print("🚀 Starting Comprehensive Test Suite for IP Management System")
        print("=" * 70)
        print("🏭 Bosch Rexroth Bursa Factory - IT/OT Network Management")
        print("=" * 70)
        
        results = []
        
        # Run all test suites
        test_suites = [
            self.run_backend_tests,
            self.run_frontend_tests,
            self.run_performance_tests,
            self.run_security_tests
        ]
        
        for test_suite in test_suites:
            try:
                result = test_suite()
                results.append(result)
                
                status = "✅ PASSED" if result["success"] else "❌ FAILED"
                print(f"{status} {result['name']} ({result['duration']:.2f}s)")
                
            except Exception as e:
                print(f"❌ ERROR in {test_suite.__name__}: {e}")
                results.append({
                    "name": test_suite.__name__.replace("run_", "").replace("_", " ").title(),
                    "success": False,
                    "duration": 0,
                    "output": f"Error: {e}",
                    "errors": str(e),
                    "report_path": "#"
                })
        
        # Generate summary report
        summary_path = self.generate_summary_report(results)
        
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r["success"])
        
        print(f"Total Test Suites: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        print(f"Total Duration: {sum(r['duration'] for r in results):.2f}s")
        
        print(f"\n🌐 Live Test Report: file://{os.path.abspath(summary_path)}")
        print(f"📁 Reports Directory: {os.path.abspath(self.reports_dir)}")
        
        # Open report in browser
        try:
            webbrowser.open(f"file://{os.path.abspath(summary_path)}")
            print("🔗 Test report opened in your default browser!")
        except:
            print("💡 Please open the test report manually in your browser.")
        
        # Exit with appropriate code
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! System ready for production.")
            sys.exit(0)
        else:
            print(f"\n⚠️  {total_tests - passed_tests} test suite(s) failed. Please review the reports.")
            sys.exit(1)


if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all_tests()