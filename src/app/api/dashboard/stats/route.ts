import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import UserFeedback from "@/models/UserFeedback";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

function checkAuth(request: NextRequest): boolean {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${password}`;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      todayCount,
      weekCount,
      bySection,
      benefitsAgg,
      dailyStats,
      recentSubmissions,
    ] = await Promise.all([
      UserFeedback.countDocuments(),
      UserFeedback.countDocuments({ createdAt: { $gte: todayStart } }),
      UserFeedback.countDocuments({ createdAt: { $gte: weekStart } }),
      UserFeedback.aggregate([
        { $group: { _id: "$sectionType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      UserFeedback.aggregate([
        {
          $group: {
            _id: null,
            healthcare: {
              $sum: { $cond: ["$suggestedBenefits.healthcare", 1, 0] },
            },
            retirement: {
              $sum: { $cond: ["$suggestedBenefits.retirement", 1, 0] },
            },
            unemployment: {
              $sum: { $cond: ["$suggestedBenefits.unemployment", 1, 0] },
            },
            disability: {
              $sum: { $cond: ["$suggestedBenefits.disability", 1, 0] },
            },
            childSupport: {
              $sum: { $cond: ["$suggestedBenefits.childSupport", 1, 0] },
            },
            withOther: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      {
                        $strLenCP: {
                          $ifNull: ["$suggestedBenefits.other", ""],
                        },
                      },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      UserFeedback.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Bangkok",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      UserFeedback.find({}).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return NextResponse.json({
      total,
      todayCount,
      weekCount,
      bySection,
      benefitsStats: benefitsAgg[0] ?? {},
      dailyStats,
      recentSubmissions,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
