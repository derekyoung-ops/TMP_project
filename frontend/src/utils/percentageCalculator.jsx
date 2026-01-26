/**
 * Calculate weighted percentage for plan completion
 * Rules:
 * - Overachievement allowed (10/15 = 150%)
 * - If income > 100%, return income percentage directly
 */
export function calculateWeightedPercentage(planData, execData) {
  if (!planData || !execData) return 0;

  const calcPercentage = (plan, actual) => {
    if ((plan <= 0 || plan === null) && actual > 0) {  
      return 100
    };
    if (actual <= 0) return 0;
    return (actual / plan) * 100;
  };

  // 1. Income (weight: 5)
  const incomePercentage = calcPercentage(
    planData.IncomePlan || 0,
    execData.IncomeActual || 0
  );

  // 🚨 Rule: income dominates
  if (incomePercentage >= 100) {
    return Number(incomePercentage.toFixed(2));
  }

  // 2. Job (weight: 2)
  const offeredJobPercentage = calcPercentage(
    planData.biddingPlan?.offeredJobAmount || 0,
    execData.biddingActual?.offeredJobAmount || 0
  );

  const totalAmountPercentage = calcPercentage(
    planData.biddingPlan?.offeredTotalBudget || 0,
    execData.biddingActual?.offeredTotalBudget || 0
  );

  const jobPercentage = (offeredJobPercentage + totalAmountPercentage) / 2;

  // 3. Realguy (weight: 2)
  const acquiredPeoplePlan = planData.realguyPlan?.acquiredPeopleAmount || 0;
  const acquiredPeopleActual = execData.realguyActual?.acquiredPeopleAmount || 0;

  let realguyPercentage = 0;

  if (acquiredPeoplePlan <= 0 && acquiredPeopleActual > 0) {
    realguyPercentage = 100;
  } else if (acquiredPeopleActual >= acquiredPeoplePlan && acquiredPeoplePlan > 0) {
    realguyPercentage = calcPercentage(acquiredPeoplePlan, acquiredPeopleActual);
  } else {
    const callNumberPercentage = calcPercentage(
      planData.realguyPlan?.callNumber || 0,
      execData.realguyActual?.callNumber || 0
    );

    const acquiredPeoplePercentage = calcPercentage(
      acquiredPeoplePlan,
      acquiredPeopleActual
    );

    realguyPercentage = (callNumberPercentage + acquiredPeoplePercentage) / 2;
  }

  // 4. Qualification (weight: 1)
  const majorPercentage = calcPercentage(
    Number(planData.qualificationPlan?.majorHours || 0),
    Number(execData.qualificationActual?.major || 0)
  );

  const englishPercentage = calcPercentage(
    Number(planData.qualificationPlan?.englishHours || 0),
    Number(execData.qualificationActual?.english || 0)
  );

  const qualificationPercentage = (majorPercentage + englishPercentage) / 2;

  // Weighted average
  const totalWeight = 10;
  const weightedSum =
    incomePercentage * 5 +
    jobPercentage * 2 +
    realguyPercentage * 2 +
    qualificationPercentage * 1;

  return Number((weightedSum / totalWeight).toFixed(2));
}