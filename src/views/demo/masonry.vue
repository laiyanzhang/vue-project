<template>
  <div class="masonry">
    <div class="flex" v-show="way === 0">
      <div class="item" v-for="(item, index) in 20" :key="index">
        {{ index }}
      </div>
    </div>
    <!-- CSS -->
    <div class="masonry_1" v-show="way === 1">
      <div class="item" v-for="(item, index) in 20" :key="index">
        {{ index }}
      </div>
    </div>
    <!-- grid布局 -->
    <div class="masonry_2" v-show="way === 2">
      <div class="item" v-for="(item, index) in 20" :key="index">
        {{ index }}
      </div>
    </div>
    <!-- felx布局 -->
    <div class="masonry_3" v-show="way === 3">
      <div class="column column_1">
        <div class="item" v-for="item in column1" :key="item">
          {{ item }}
        </div>
      </div>
      <div class="column column_2">
        <div class="item" v-for="item in column2" :key="item">
          {{ item }}
        </div>
      </div>
      <div class="column column_3">
        <div class="item" v-for="item in column3" :key="item">
          {{ item }}
        </div>
      </div>
    </div>
    <!-- 第三方库 -->
    <div class="masonry_4" v-show="way === 4">
      <div class="grid-sizer"></div>
      <div class="gutter-sizer"></div>
      <div class="grid-item">1</div>
      <div class="grid-item grid-item-width2">2</div>
      <div class="grid-item">3</div>
      <div class="grid-item">4</div>
      <div class="grid-item">5</div>
      <div class="grid-item">6</div>
      <div class="grid-item">7</div>
      <div class="grid-item">8</div>
      <div class="grid-item">9</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import Masonry from "masonry-layout";

export default defineComponent({
  name: "masonry",
  setup() {
    const way = ref(2);
    onMounted(() => {
      // grid布局
      const masonry = document.querySelector(".masonry_2");
      const items = masonry.querySelectorAll(".masonry_2 .item");
      items.forEach((item) => {
        // 模拟高度获取，若为图片可获取图片高度
        const height = Math.floor(Math.random() * 200 + 50);
        // 根据元素高度设置元素的需占行数
        const rows = Math.ceil(height / 10);
        item.style.gridRowStart = `span ${rows}`
      });

      // 第三方库
      new Masonry(".masonry_4", {
        columnWidth: ".grid-sizer", // 列宽度，未设置时将第一个项的宽度作为列宽度，也支持设置固定宽度
        gutter: ".gutter-sizer", // 添加项元素间的横向间隔，也支持设置固定宽度
        itemSelector: ".grid-item", // 指定将在布局中作为项的子元素
        percentPosition: true, // 将项的位置设为百分比优于设为像素值
        transitionDuration: "0.2s", // 过渡效果持续时间
        stagger: 30, // 项转换位置时为其提供交错效果，用以毫秒为单位的数字
      });
    });

    // felx布局
    const data = ref([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
    let column1 = ref([]), //第一列
      column2 = ref([]), //第二列
      column3 = ref([]); //第三列
    let i = 0;
    while (i < data.value.length) {
      column1.value.push(data.value[i++]);
      if (i < data.value.length) {
        column2.value.push(data.value[i++]);
      }
      if (i < data.value.length) {
        column3.value.push(data.value[i++]);
      }
    }

    return {
      way,
      column1,
      column2,
      column3,
    };
  },
});
</script>

<style scoped lang="less">
.flex {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .item {
    width: 24%;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;

    &:nth-child(n) {
      height: 200px;
    }

    &:nth-child(2n) {
      height: 300px;
    }

    &:nth-child(3n) {
      height: 400px;
    }
  }
}

.masonry_1 {
  width: 100%;
  columns: 4;
  column-gap: 8px;

  .item {
    width: 100%;
    break-inside: avoid;
    margin-bottom: 8px;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;

    &:nth-child(n) {
      height: 200px;
    }

    &:nth-child(2n) {
      height: 300px;
    }

    &:nth-child(3n) {
      height: 1200px;
    }
  }
}

.masonry_2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  grid-auto-rows: 10px;

  .item {
    background: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.masonry_3 {
  display: flex;
  gap: 8px;

  .column {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;

    .item {
      width: 100%;
      background-color: #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
    }
  }

  .column_1 {
    .item {
      &:nth-child(n) {
        height: 280px;
      }

      &:nth-child(2n) {
        height: 100px;
      }

      &:nth-child(3n) {
        height: 320px;
      }
    }
  }

  .column_2 {
    .item {
      &:nth-child(n) {
        height: 200px;
      }

      &:nth-child(2n) {
        height: 320px;
      }

      &:nth-child(3n) {
        height: 120px;
      }
    }
  }

  .column_3 {
    .item {
      &:nth-child(n) {
        height: 230px;
      }

      &:nth-child(2n) {
        height: 340px;
      }

      &:nth-child(3n) {
        height: 600px;
      }
    }
  }
}

.masonry_4 {
  width: 100%;
  height: 100%;
  position: relative;

  .grid-sizer {
    width: calc(25% - 12px);
  }

  .gutter-sizer {
    width: 8px;
  }

  .grid-item {
    width: calc(25% - 12px);
    margin-bottom: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background-color: #ccc;

    &:nth-child(n) {
      height: 200px;
    }

    &:nth-child(2n) {
      height: 300px;
    }

    &:nth-child(3n) {
      height: 400px;
    }
  }

  .grid-item-width2 {
    width: calc(50% - 16px);
    height: 300px;
  }
}
</style>
