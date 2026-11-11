/**
 * Credit Builder Flow • Dealership Portal Prospect Intelligence & Analytics
 * Integrated with Microsoft Clarity (Project ID: yi9wab3vxv)
 */

(function() {
    'use strict';

    // 1. Prospect Data Extraction & Persistence
    function getProspectInfo() {
        try {
            var params = new URLSearchParams(window.location.search);
            var dealerParam = params.get('dealer');
            var contactParam = params.get('contact');
            var declinesParam = params.get('declines');

            if (dealerParam) localStorage.setItem('cbf_dealer', decodeURIComponent(dealerParam.replace(/\+/g, ' ')));
            if (contactParam) localStorage.setItem('cbf_contact', decodeURIComponent(contactParam.replace(/\+/g, ' ')));
            if (declinesParam) localStorage.setItem('cbf_declines', declinesParam);

            var dealer = localStorage.getItem('cbf_dealer') || 'General Prospect';
            var contact = localStorage.getItem('cbf_contact') || 'Executive Contact';
            var declines = localStorage.getItem('cbf_declines') || '25';

            return {
                dealer: dealer,
                contact: contact,
                declines: declines
            };
        } catch (e) {
            return { dealer: 'General Prospect', contact: 'Executive Contact', declines: '25' };
        }
    }

    // 2. Identify and Tag Session in Clarity
    function tagClaritySession() {
        if (typeof window.clarity !== 'function') return;

        var prospect = getProspectInfo();
        
        // Set custom tags searchable and filterable in Clarity Dashboard
        window.clarity('set', 'Dealership', prospect.dealer);
        window.clarity('set', 'ExecutiveContact', prospect.contact);
        window.clarity('set', 'MonthlyDeclines', prospect.declines);
        window.clarity('set', 'PageTitle', document.title);

        // Identify prospect friendly name for session recordings
        window.clarity('identify', prospect.dealer, null, null, prospect.contact + ' (' + prospect.dealer + ')');
    }

    // Run identification when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tagClaritySession);
    } else {
        tagClaritySession();
    }

    // 3. High-Intent Sales Event Listeners
    document.addEventListener('click', function(e) {
        if (typeof window.clarity !== 'function') return;

        var el = e.target.closest('a, button');
        if (!el) return;

        var href = el.getAttribute('href') || '';
        var text = (el.innerText || '').toLowerCase();

        // WhatsApp Direct Contact Clicks
        if (href.indexOf('wa.me') !== -1) {
            window.clarity('event', 'click_whatsapp_contact');
        }
        // Onboarding / Booking Schedule Clicks
        else if (href.indexOf('book-onboarding') !== -1 || text.indexOf('book') !== -1 || text.indexOf('schedule') !== -1) {
            window.clarity('event', 'click_book_onboarding');
        }
        // Master Service Agreement Inspection
        else if (href.indexOf('dealership-service-agreement') !== -1 || text.indexOf('agreement') !== -1) {
            window.clarity('event', 'click_view_agreement');
        }
        // Forensic Case Study Inspections
        else if (href.indexOf('case-study-') !== -1) {
            window.clarity('event', 'click_case_study_dossier');
        }
        // Start Recovery CTAs
        else if (text.indexOf('start recovering') !== -1 || text.indexOf('activate cbf') !== -1) {
            window.clarity('event', 'click_start_recovering');
        }
    });

    // 4. ROI Calculator Interaction Tracking (if on 01-commercial-roi.html)
    document.addEventListener('DOMContentLoaded', function() {
        var leadsSlider = document.getElementById('declines-slider');
        var profitSlider = document.getElementById('profit-slider');

        if (leadsSlider) {
            leadsSlider.addEventListener('change', function() {
                if (typeof window.clarity === 'function') {
                    window.clarity('event', 'adjusted_declines_slider');
                    window.clarity('set', 'CalculatedDeclines', leadsSlider.value);
                }
            });
        }

        if (profitSlider) {
            profitSlider.addEventListener('change', function() {
                if (typeof window.clarity === 'function') {
                    window.clarity('event', 'adjusted_profit_slider');
                }
            });
        }
    });

    // Global helper
    window.cbfTrack = function(eventName, tagData) {
        if (typeof window.clarity === 'function') {
            if (eventName) window.clarity('event', eventName);
            if (tagData && typeof tagData === 'object') {
                for (var key in tagData) {
                    if (tagData.hasOwnProperty(key)) {
                        window.clarity('set', key, String(tagData[key]));
                    }
                }
            }
        }
    };
})();
