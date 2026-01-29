export function calculateWeightedPercentage(planData, execData) {
  if (!planData || !execData) return 0

  const calcPercentage = (plan, actual) => {
    if ((plan <= 0 || plan === null) && actual > 0) return 100
    if (actual <= 0 || plan <= 0) return 0
    return (actual / plan) * 100
  }

  // 1️⃣ Income (weight 5)
  const incomePercentage = calcPercentage(
    planData.IncomePlan || 0,
    execData.IncomeActual || 0
  )

  // Income dominates
  if (incomePercentage >= 100) {
    return Number(incomePercentage.toFixed(2))
  }

  // 2️⃣ Bidding (weight 2)
  const jobPercentage =
    (
      calcPercentage(
        planData.biddingPlan?.offeredJobAmount || 0,
        execData.biddingActual?.offeredJobAmount || 0
      ) +
      calcPercentage(
        planData.biddingPlan?.offeredTotalBudget || 0,
        execData.biddingActual?.offeredTotalBudget || 0
      )
    ) / 2

  // 3️⃣ Realguy (weight 2)
  const realguyPercentage =
    (
      calcPercentage(
        planData.realguyPlan?.callNumber || 0,
        execData.realguyActual?.callNumber || 0
      ) +
      calcPercentage(
        planData.realguyPlan?.acquiredPeopleAmount || 0,
        execData.realguyActual?.acquiredPeopleAmount || 0
      )
    ) / 2

  // 4️⃣ Qualification (weight 1)
  const qualificationPercentage =
    (
      calcPercentage(
        planData.qualificationPlan?.majorHours || 0,
        execData.qualificationActual?.major || 0
      ) +
      calcPercentage(
        planData.qualificationPlan?.englishHours || 0,
        execData.qualificationActual?.english || 0
      )
    ) / 2

  const weightedSum =
    incomePercentage * 5 +
    jobPercentage * 2 +
    realguyPercentage * 2 +
    qualificationPercentage * 1

  return Number((weightedSum / 10).toFixed(2))
}