# methodology_improvements.py
# Future enhancements for Idea Lab's market validation methodology
# PRIORITY: Come back to this after the prototype is working

# ===== SOURCE QUALITY WEIGHTING IMPROVEMENTS =====
def calculate_weighted_confidence_score(sources):
    """
    Replaces our naive 'more sources = higher confidence' approach
    with a true quality-weighted system.
    """
    # 1. SOURCE AUTHORITY WEIGHTS
    authority_weights = {
        'market_research_report': 10,   # Paid market research (Gartner, etc)
        'industry_association': 8,      # Industry association reports
        'financial_report': 9,          # Annual reports, investor decks
        'academic_study': 8,            # Academic papers, university research
        'government_data': 7,           # Census data, economic reports
        'news_article': 5,              # News publications
        'company_blog': 3,              # Company blogs (biased but useful)
        'forum_discussion': 2           # Forums, Reddit, etc (anecdotal)
    }
    
    # 2. RECENCY ADJUSTMENTS
    def recency_multiplier(year):
        """Older data gets exponentially discounted"""
        current_year = 2025  # Update this annually 
        age = current_year - year
        if age <= 1:
            return 1.0   # Current data (full value)
        elif age <= 3:
            return 0.8   # 1-3 years old (slight discount)
        elif age <= 5:
            return 0.6   # 3-5 years old (moderate discount)
        else:
            return 0.4   # >5 years old (heavy discount)
    
    # 3. METHODOLOGY TRANSPARENCY BONUS
    # Add +2 points if the source clearly explains methodology
    
    # 4. CONSENSUS ALIGNMENT
    # Sources that align with the consensus get a slight boost
    # Outliers get slightly penalized unless they have excellent methodology

    # TODO: Implement a Bayesian confidence approach where each source
    # updates our confidence level rather than simple averaging


# ===== STATISTICAL VALIDATION METHODS =====
def detect_outliers_and_reconcile(market_sizes):
    """
    Reconcile wildly different market size estimates
    (Because when one source says $1B and another says $36B, we're doing
    something wrong by just averaging them)
    """
    # 1. OUTLIER DETECTION
    # Use z-scores or IQR method to identify statistical outliers
    
    # 2. HANDLING DISTRIBUTION SHAPES
    # For right-skewed distributions (common in market sizes), use:
    #   - Geometric mean instead of arithmetic mean
    #   - Median instead of mean for central tendency
    #   - Log-transform data before statistical analysis
    
    # 3. CLASSIFICATION OF ESTIMATION METHODS
    # Group sources by methodology:
    #   - Top-down approaches 
    #   - Bottom-up approaches
    #   - Value-based approaches
    # Calculate separate estimates for each methodology, then reconcile


def calculate_confidence_intervals(point_estimate, sources):
    """
    Replace point estimates with confidence intervals
    (Because no entrepreneur should believe "$5.2B" without error bars)
    """
    # 1. BOOTSTRAP RESAMPLING
    # Use bootstrap resampling of our sources to generate confidence intervals
    
    # 2. MONTE CARLO SIMULATION
    # Identify key variables and their possible ranges
    # Run thousands of simulations with different variable combinations
    # Present the 10th, 50th and 90th percentiles as reasonable bounds
    
    # 3. EXPERT CALIBRATION
    # Compare our estimates against known markets to calibrate our confidence


# ===== TRIANGULATION METHODS =====
def triangulate_market_data(sources, market_sizing):
    """
    Don't just collect data points - meaningfully triangulate them
    """
    # 1. DELPHI METHOD ANALOG
    # Weight and re-weight sources through multiple passes
    # Identify where consensus exists vs. where sources diverge
    
    # 2. CROSS-CHECK WITH ALTERNATIVE METRICS
    # For example: if TAM = population × price, verify both components separately
    # Reconcile top-down vs. bottom-up approaches
    
    # 3. DECOMPOSITION AND RECOMPOSITION
    # Break market into segments, size each separately, then recombine
    # Compare against whole-market estimates for sanity check
    
    # 4. TIME-SERIES VALIDATION
    # Compare current estimates against historical growth trajectories
    # Flag inconsistencies where current estimates imply unrealistic growth


# ===== ASSUMPTION DOCUMENTATION & TESTING =====
def sensitivity_analysis(market_sizing_model, assumptions):
    """
    Don't present entrepreneurs with a black box number.
    Show them which assumptions matter most.
    """
    # 1. TORNADO ANALYSIS
    # Vary each input assumption by ±20% and measure impact on final estimate
    # Rank assumptions by sensitivity (which ones really matter)
    
    # 2. SCENARIO MODELING
    # Create conservative, moderate, and optimistic scenarios
    # Show how they affect the entire TAM/SAM/SOM funnel
    
    # 3. DYNAMIC DASHBOARD
    # Let users adjust key assumptions and see impacts in real-time
    # Helps entrepreneurs develop intuition for market dynamics
    
    # 4. THRESHOLD ANALYSIS
    # "At what market penetration would this be a $100M business?"
    # Work backwards from goals to required assumptions


# ===== PRESENTATION IMPROVEMENTS =====
def improve_presentation(results):
    """
    Humans are bad at understanding uncertainty.
    Help them visualize it.
    """
    # 1. VISUALIZATION IMPROVEMENTS
    # - Use gradient-filled ranges rather than hard numbers
    # - Show sample space of outcomes as a distribution
    # - Present TAM/SAM/SOM as a funnel with confidence bands
    
    # 2. COMPARATIVE ANCHORING
    # "This market is approximately the size of the US coffee shop industry"
    # "Your projected market share is similar to what Zoom achieved in 2 years"
    
    # 3. UNIT ECONOMICS EXTRAPOLATION
    # Connect market size to unit economics:
    # "A 2% market share means acquiring X customers at $Y CAC"
    
    # 4. NARRATIVE WARNINGS
    # Flag potential cognitive biases in the analysis
    # Highlight when founder assumptions diverge significantly from market data


# ===== IMPLEMENTATION COMPLEXITY GUIDE =====
# 💀 = Hard, time-consuming, may require data we don't have
# 🔥 = Medium difficulty, good ROI on effort
# ✅ = Easy win, implement ASAP

# PHASE 1 (POST-PROTOTYPE):
# ✅ Source authority weighting 
# ✅ Simple outlier detection for market sizes
# ✅ Basic confidence intervals
# 🔥 Assumption documentation

# PHASE 2:
# 🔥 Recency adjustments for sources
# 🔥 Delphi-like reconciliation 
# 🔥 Simple sensitivity analysis
# 💀 Monte Carlo simulations

# PHASE 3:
# 💀 Full Bayesian confidence model
# 💀 Dynamic assumption testing
# 💀 Comparative anchoring database