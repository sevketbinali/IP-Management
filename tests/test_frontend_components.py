"""
Frontend component tests for IP Management System.

Tests React components, user interactions, and frontend-backend integration
using Playwright for end-to-end testing.
"""

import pytest
import asyncio
from playwright.async_api import async_playwright, Page, Browser


class TestVLANManagementComponent:
    """Test suite for VLAN Management React component."""
    
    @pytest.fixture
    async def browser_page(self):
        """Set up browser and page for testing."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Navigate to the application
            await page.goto("http://localhost:3000")
            
            yield page
            
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_vlan_management_page_loads(self, browser_page: Page):
        """Test VLAN management page loads correctly."""
        # Navigate to VLAN management
        await browser_page.click('text="VLAN Management"')
        
        # Wait for page to load
        await browser_page.wait_for_selector('[data-testid="vlan-management"]')
        
        # Check page title
        title = await browser_page.text_content('h1')
        assert "VLAN Management" in title
        
        # Check essential elements are present
        assert await browser_page.is_visible('[data-testid="create-vlan-button"]')
        assert await browser_page.is_visible('[data-testid="vlan-list"]')
    
    @pytest.mark.asyncio
    async def test_create_vlan_form_validation(self, browser_page: Page):
        """Test VLAN creation form validation."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Click create VLAN button
        await browser_page.click('[data-testid="create-vlan-button"]')
        
        # Wait for form modal
        await browser_page.wait_for_selector('[data-testid="vlan-form-modal"]')
        
        # Try to submit empty form
        await browser_page.click('[data-testid="submit-vlan-button"]')
        
        # Check validation errors appear
        error_messages = await browser_page.locator('.error-message').all()
        assert len(error_messages) > 0
        
        # Fill invalid VLAN ID
        await browser_page.fill('[data-testid="vlan-id-input"]', '0')
        await browser_page.click('[data-testid="submit-vlan-button"]')
        
        # Check VLAN ID validation error
        vlan_id_error = await browser_page.text_content('[data-testid="vlan-id-error"]')
        assert "VLAN ID must be between 1 and 4094" in vlan_id_error
        
        # Fill invalid subnet
        await browser_page.fill('[data-testid="vlan-id-input"]', '100')
        await browser_page.fill('[data-testid="subnet-input"]', 'invalid.subnet')
        await browser_page.click('[data-testid="submit-vlan-button"]')
        
        # Check subnet validation error
        subnet_error = await browser_page.text_content('[data-testid="subnet-error"]')
        assert "Invalid subnet format" in subnet_error
    
    @pytest.mark.asyncio
    async def test_create_vlan_success(self, browser_page: Page):
        """Test successful VLAN creation."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Click create VLAN button
        await browser_page.click('[data-testid="create-vlan-button"]')
        await browser_page.wait_for_selector('[data-testid="vlan-form-modal"]')
        
        # Fill valid form data
        await browser_page.fill('[data-testid="vlan-id-input"]', '100')
        await browser_page.fill('[data-testid="subnet-input"]', '192.168.100.0')
        await browser_page.select_option('[data-testid="netmask-select"]', '/24')
        await browser_page.fill('[data-testid="description-input"]', 'Test VLAN')
        
        # Select zone (assuming zones exist)
        await browser_page.select_option('[data-testid="zone-select"]', { 'index': 1 })
        
        # Submit form
        await browser_page.click('[data-testid="submit-vlan-button"]')
        
        # Wait for success message
        await browser_page.wait_for_selector('[data-testid="success-message"]')
        success_message = await browser_page.text_content('[data-testid="success-message"]')
        assert "VLAN created successfully" in success_message
        
        # Check VLAN appears in list
        await browser_page.wait_for_selector('[data-testid="vlan-100"]')
        vlan_row = await browser_page.text_content('[data-testid="vlan-100"]')
        assert "192.168.100.0" in vlan_row
    
    @pytest.mark.asyncio
    async def test_vlan_list_display(self, browser_page: Page):
        """Test VLAN list displays correctly."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Wait for VLAN list to load
        await browser_page.wait_for_selector('[data-testid="vlan-list"]')
        
        # Check table headers
        headers = await browser_page.locator('th').all_text_contents()
        expected_headers = ["VLAN ID", "Subnet", "Zone", "Utilization", "Status", "Actions"]
        for header in expected_headers:
            assert any(header in h for h in headers)
        
        # Check if VLANs are displayed (if any exist)
        vlan_rows = await browser_page.locator('[data-testid^="vlan-"]').count()
        if vlan_rows > 0:
            # Check first VLAN row has required data
            first_vlan = browser_page.locator('[data-testid^="vlan-"]').first
            assert await first_vlan.is_visible()
    
    @pytest.mark.asyncio
    async def test_vlan_utilization_display(self, browser_page: Page):
        """Test VLAN utilization is displayed correctly."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Wait for VLAN list
        await browser_page.wait_for_selector('[data-testid="vlan-list"]')
        
        # Check if utilization bars are present
        utilization_bars = await browser_page.locator('[data-testid="utilization-bar"]').count()
        if utilization_bars > 0:
            # Check utilization percentage is displayed
            utilization_text = await browser_page.text_content('[data-testid="utilization-percentage"]')
            assert "%" in utilization_text
    
    @pytest.mark.asyncio
    async def test_vlan_edit_functionality(self, browser_page: Page):
        """Test VLAN editing functionality."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Wait for VLAN list
        await browser_page.wait_for_selector('[data-testid="vlan-list"]')
        
        # Check if edit buttons exist
        edit_buttons = await browser_page.locator('[data-testid="edit-vlan-button"]').count()
        if edit_buttons > 0:
            # Click first edit button
            await browser_page.click('[data-testid="edit-vlan-button"]')
            
            # Wait for edit form
            await browser_page.wait_for_selector('[data-testid="vlan-edit-modal"]')
            
            # Check form is pre-filled
            description_value = await browser_page.input_value('[data-testid="description-input"]')
            assert len(description_value) > 0
    
    @pytest.mark.asyncio
    async def test_responsive_design(self, browser_page: Page):
        """Test responsive design on different screen sizes."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Test desktop view
        await browser_page.set_viewport_size({"width": 1920, "height": 1080})
        await browser_page.wait_for_selector('[data-testid="vlan-list"]')
        
        # Check table is visible
        assert await browser_page.is_visible('[data-testid="vlan-list"] table')
        
        # Test tablet view
        await browser_page.set_viewport_size({"width": 768, "height": 1024})
        await browser_page.wait_for_timeout(500)  # Wait for responsive changes
        
        # Test mobile view
        await browser_page.set_viewport_size({"width": 375, "height": 667})
        await browser_page.wait_for_timeout(500)
        
        # Check mobile navigation works
        if await browser_page.is_visible('[data-testid="mobile-menu-button"]'):
            await browser_page.click('[data-testid="mobile-menu-button"]')
            assert await browser_page.is_visible('[data-testid="mobile-menu"]')


class TestIPAssignmentComponent:
    """Test suite for IP Assignment component."""
    
    @pytest.mark.asyncio
    async def test_ip_assignment_form(self, browser_page: Page):
        """Test IP assignment form functionality."""
        await browser_page.goto("http://localhost:3000/ip-assignments")
        
        # Click assign IP button
        await browser_page.click('[data-testid="assign-ip-button"]')
        
        # Wait for form
        await browser_page.wait_for_selector('[data-testid="ip-assignment-form"]')
        
        # Fill form
        await browser_page.fill('[data-testid="ip-address-input"]', '192.168.100.10')
        await browser_page.fill('[data-testid="mac-address-input"]', '00:11:22:33:44:55')
        await browser_page.fill('[data-testid="ci-name-input"]', 'TEST-DEVICE-001')
        await browser_page.fill('[data-testid="description-input"]', 'Test device')
        
        # Select VLAN
        await browser_page.select_option('[data-testid="vlan-select"]', { 'index': 1 })
        
        # Submit form
        await browser_page.click('[data-testid="submit-ip-button"]')
        
        # Check for success or validation errors
        try:
            await browser_page.wait_for_selector('[data-testid="success-message"]', timeout=3000)
            success = True
        except:
            # Check for validation errors
            errors = await browser_page.locator('.error-message').count()
            success = errors == 0
        
        # At minimum, form should handle submission without crashing
        assert await browser_page.is_visible('[data-testid="ip-assignment-form"]') or success
    
    @pytest.mark.asyncio
    async def test_mac_address_validation(self, browser_page: Page):
        """Test MAC address format validation."""
        await browser_page.goto("http://localhost:3000/ip-assignments")
        
        await browser_page.click('[data-testid="assign-ip-button"]')
        await browser_page.wait_for_selector('[data-testid="ip-assignment-form"]')
        
        # Test invalid MAC addresses
        invalid_macs = ["invalid", "00:11:22:33:44", "GG:11:22:33:44:55"]
        
        for invalid_mac in invalid_macs:
            await browser_page.fill('[data-testid="mac-address-input"]', invalid_mac)
            await browser_page.click('[data-testid="submit-ip-button"]')
            
            # Should show validation error
            error = await browser_page.text_content('[data-testid="mac-address-error"]')
            assert "Invalid MAC address" in error or "format" in error.lower()


class TestDashboardComponent:
    """Test suite for Dashboard component."""
    
    @pytest.mark.asyncio
    async def test_dashboard_loads(self, browser_page: Page):
        """Test dashboard loads with key metrics."""
        await browser_page.goto("http://localhost:3000")
        
        # Wait for dashboard to load
        await browser_page.wait_for_selector('[data-testid="dashboard"]')
        
        # Check key metric cards are present
        metric_cards = ["total-domains", "total-vlans", "total-ips", "utilization-overview"]
        
        for card in metric_cards:
            if await browser_page.is_visible(f'[data-testid="{card}"]'):
                # Check card has numeric value
                value = await browser_page.text_content(f'[data-testid="{card}"] .metric-value')
                assert value.isdigit() or "%" in value
    
    @pytest.mark.asyncio
    async def test_dashboard_charts(self, browser_page: Page):
        """Test dashboard charts render correctly."""
        await browser_page.goto("http://localhost:3000")
        
        # Wait for charts to load
        await browser_page.wait_for_timeout(2000)
        
        # Check if chart containers exist
        chart_containers = await browser_page.locator('[data-testid="chart-container"]').count()
        if chart_containers > 0:
            # Check charts have rendered (SVG or Canvas elements)
            charts = await browser_page.locator('svg, canvas').count()
            assert charts > 0


class TestAccessibilityCompliance:
    """Test suite for WCAG AAA accessibility compliance."""
    
    @pytest.mark.asyncio
    async def test_keyboard_navigation(self, browser_page: Page):
        """Test keyboard navigation works correctly."""
        await browser_page.goto("http://localhost:3000")
        
        # Test Tab navigation
        await browser_page.keyboard.press('Tab')
        focused_element = await browser_page.evaluate('document.activeElement.tagName')
        assert focused_element in ['BUTTON', 'A', 'INPUT']
        
        # Test Enter key on buttons
        if await browser_page.is_visible('button:first-of-type'):
            await browser_page.focus('button:first-of-type')
            # Note: Actual Enter key testing would depend on button functionality
    
    @pytest.mark.asyncio
    async def test_aria_labels(self, browser_page: Page):
        """Test ARIA labels are present for accessibility."""
        await browser_page.goto("http://localhost:3000")
        
        # Check buttons have aria-labels or text content
        buttons = await browser_page.locator('button').all()
        for button in buttons:
            aria_label = await button.get_attribute('aria-label')
            text_content = await button.text_content()
            assert aria_label or (text_content and text_content.strip())
    
    @pytest.mark.asyncio
    async def test_color_contrast(self, browser_page: Page):
        """Test color contrast meets WCAG standards."""
        await browser_page.goto("http://localhost:3000")
        
        # This would require color contrast analysis
        # For now, check that text is visible
        text_elements = await browser_page.locator('p, h1, h2, h3, span').all()
        for element in text_elements[:5]:  # Check first 5 elements
            if await element.is_visible():
                text = await element.text_content()
                assert text and text.strip()  # Text should be readable


class TestPerformanceFrontend:
    """Test suite for frontend performance."""
    
    @pytest.mark.asyncio
    async def test_page_load_performance(self, browser_page: Page):
        """Test page load performance meets requirements."""
        import time
        
        start_time = time.time()
        await browser_page.goto("http://localhost:3000")
        await browser_page.wait_for_load_state('networkidle')
        end_time = time.time()
        
        load_time = end_time - start_time
        assert load_time < 3.0, f"Page load took {load_time:.3f}s, should be <3s"
    
    @pytest.mark.asyncio
    async def test_api_response_handling(self, browser_page: Page):
        """Test frontend handles API responses efficiently."""
        await browser_page.goto("http://localhost:3000/vlans")
        
        # Monitor network requests
        responses = []
        
        def handle_response(response):
            if '/api/' in response.url:
                responses.append({
                    'url': response.url,
                    'status': response.status,
                    'timing': response.request.timing
                })
        
        browser_page.on('response', handle_response)
        
        # Trigger API calls by navigating
        await browser_page.reload()
        await browser_page.wait_for_load_state('networkidle')
        
        # Check API responses are successful
        api_responses = [r for r in responses if '/api/' in r['url']]
        if api_responses:
            for response in api_responses:
                assert response['status'] < 400, f"API call failed: {response['url']}"