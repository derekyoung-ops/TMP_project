/**
 * Calculate weighted percentage for plan completion
 * 
 * Weights:
 * - income: 5
 * - job: 2 (offeredJobAmount and totalamount in 5:5 ratio)
 * - realguy: 2 (if acquiredPeopleAmount is completed, 100%; otherwise use callNumber percentage)
 * - qualification: 1
 * 
 * @param {Object} planData - Plan data object
 * @param {Object} execData - Execution data object
 * @returns {number} Weighted completion percentage (0-100)
 */
export function calculateWeightedPercentage(planData, execData) {
  if (!planData || !execData) return 0;

  // 1. Income (weight: 5)
  const incomePlan = planData.IncomePlan || 0;
  const incomeActual = execData.IncomeActual || 0;
  const incomePercentage = incomePlan > 0 
    ? Math.min((incomeActual / incomePlan) * 100, 100) 
    : 0;

  // 2. Job (weight: 2)
  // offeredJobAmount and totalamount (offeredTotalBudget) in 5:5 ratio
  const offeredJobPlan = planData.biddingPlan?.offeredJobAmount || 0;
  const offeredJobActual = execData.biddingActual?.offeredJobAmount || 0;
  const offeredJobPercentage = offeredJobPlan > 0
    ? Math.min((offeredJobActual / offeredJobPlan) * 100, 100)
    : 0;

  const totalAmountPlan = planData.biddingPlan?.offeredTotalBudget || 0;
  const totalAmountActual = execData.biddingActual?.offeredTotalBudget || 0;
  const totalAmountPercentage = totalAmountPlan > 0
    ? Math.min((totalAmountActual / totalAmountPlan) * 100, 100)
    : 0;

  // Job percentage: average of offeredJobAmount and totalAmount (5:5 ratio = 50:50)
  const jobPercentage = (offeredJobPercentage + totalAmountPercentage) / 2;

  // 3. Realguy (weight: 2)
  // If acquiredPeopleAmount is completed, it's 100%
  // Otherwise, calculate percentage of completed portion using callNumber percentage
  const acquiredPeoplePlan = planData.realguyPlan?.acquiredPeopleAmount || 0;
  const acquiredPeopleActual = execData.realguyActual?.acquiredPeopleAmount || 0;
  
  let realguyPercentage = 0;
  if (acquiredPeoplePlan > 0 && acquiredPeopleActual >= acquiredPeoplePlan) {
    // If acquiredPeopleAmount is completed, it's 100%
    realguyPercentage = 100;
  } else {
    // Otherwise, use callNumber percentage
    const callNumberPlan = planData.realguyPlan?.callNumber || 0;
    const callNumberActual = execData.realguyActual?.callNumber || 0;
    const callNumberPercentage = callNumberPlan > 0
      ? Math.min((callNumberActual / callNumberPlan) * 100, 100)
      : 0;
    
    // Calculate percentage of completed portion for acquiredPeopleAmount
    const acquiredPeoplePortion = acquiredPeoplePlan > 0
      ? Math.min((acquiredPeopleActual / acquiredPeoplePlan) * 100, 100)
      : 0;
    
    // Each item weighted 5:5 (50:50)
    realguyPercentage = (callNumberPercentage + acquiredPeoplePortion) / 2;
  }

  // 4. Qualification (weight: 1)
  const majorPlan = Number(planData.qualificationPlan?.majorHours || 0);
  const majorActual = Number(execData.qualificationActual?.major || execData.qualificationActual?.majorHours || 0);
  const majorPercentage = majorPlan > 0
    ? Math.min((majorActual / majorPlan) * 100, 100)
    : 0;

  const englishPlan = Number(planData.qualificationPlan?.englishHours || 0);
  const englishActual = Number(execData.qualificationActual?.english || execData.qualificationActual?.englishHours || 0);
  const englishPercentage = englishPlan > 0
    ? Math.min((englishActual / englishPlan) * 100, 100)
    : 0;

  // Qualification percentage: average of major and english
  const qualificationPercentage = (majorPercentage + englishPercentage) / 2;

  // Calculate weighted average
  const totalWeight = 5 + 2 + 2 + 1; // 10
  const weightedSum = 
    (incomePercentage * 5) +
    (jobPercentage * 2) +
    (realguyPercentage * 2) +
    (qualificationPercentage * 1);

  return Math.round(weightedSum / totalWeight);
}
