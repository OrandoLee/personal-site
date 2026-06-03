import { prisma } from "../lib/db";

async function main() {
  await prisma.labProject.upsert({
    where: { slug: "numeric-tower" },
    update: {
      title: "数值高塔",
      summary:
        "一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。",
      description: null,
      categoryKey: "game",
      category: "游戏原型",
      status: "原型",
      coverImage: null,
      openMode: "embed",
      embedUrl: null,
      externalUrl: null,
      internalPath: null,
      sortOrder: 1,
      isPublished: true
    },
    create: {
      title: "数值高塔",
      slug: "numeric-tower",
      summary:
        "一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。",
      description: null,
      categoryKey: "game",
      category: "游戏原型",
      status: "原型",
      coverImage: null,
      openMode: "embed",
      embedUrl: null,
      externalUrl: null,
      internalPath: null,
      sortOrder: 1,
      isPublished: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
