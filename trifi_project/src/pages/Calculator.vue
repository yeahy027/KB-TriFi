    <template>
        <!-- 모달 배경 -->
        <div class="calc-modal" v-if="visible">
        <div class="calc-modal-content">
            <!-- 닫기 버튼 -->
            <button @click="onClose" class="close-btn">X</button>
    
            <h4>간단 계산기</h4>
            <!-- 결과 창 -->
            <div class="display">{{ displayValue }}</div>
    
            <!-- 키패드 -->
            <div class="keypad">
            <button @click="onDigit('7')">7</button>
            <button @click="onDigit('8')">8</button>
            <button @click="onDigit('9')">9</button>
            <button @click="onOperator('/')">÷</button>
            <br />
    
            <button @click="onDigit('4')">4</button>
            <button @click="onDigit('5')">5</button>
            <button @click="onDigit('6')">6</button>
            <button @click="onOperator('*')">×</button>
            <br />
    
            <button @click="onDigit('1')">1</button>
            <button @click="onDigit('2')">2</button>
            <button @click="onDigit('3')">3</button>
            <button @click="onOperator('-')">-</button>
            <br />
    
            <button @click="onDigit('0')">0</button>
            <button @click="onClear">C</button>
            <button @click="onEquals">=</button>
            <button @click="onOperator('+')">+</button>
            </div>
        </div>
        </div>
    </template>
    
    <script setup>
    import { ref, watch } from 'vue';
    
    /**
     * 부모 컴포넌트에서
     *   <Calculator :visible="isCalculatorOpen" @close="isCalculatorOpen=false" />
     * 형태로 사용한다고 가정합니다.
     */
    
    // 받아올 props, 발생시킬 이벤트
    const props = defineProps({
        visible: {
        type: Boolean,
        default: false,
        },
    });
    
    const emit = defineEmits(['close']);
    
    // 내부 상태
    const displayValue = ref('0');
    let firstOperand = null;
    let operator = null;
    let waitingForSecondOperand = false;
    
    /** 닫기 (X 버튼) */
    function onClose() {
        emit('close');
    }
    
    /** 숫자 클릭 시 */
    function onDigit(digit) {
        if (waitingForSecondOperand) {
        displayValue.value = digit;
        waitingForSecondOperand = false;
        } else {
        // 처음이 0이면 치환, 아니면 이어붙이기
        displayValue.value =
            displayValue.value === '0' ? digit : displayValue.value + digit;
        }
    }
    
    /** 연산자 클릭 시 */
    function onOperator(nextOperator) {
        const inputValue = parseFloat(displayValue.value);
    
        if (operator && waitingForSecondOperand) {
        // 연산자만 바꾸고 반환
        operator = nextOperator;
        return;
        }
    
        if (firstOperand == null) {
        firstOperand = inputValue;
        } else if (operator) {
        const result = calculate(firstOperand, inputValue, operator);
        displayValue.value = `${parseFloat(result.toFixed(7))}`;
        firstOperand = result;
        }
    
        operator = nextOperator;
        waitingForSecondOperand = true;
    }
    
    /** 실제 연산 */
    function calculate(a, b, op) {
        switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return b === 0 ? 0 : a / b;
        default:
            return b;
        }
    }
    
    /** = 버튼 */
    function onEquals() {
        const inputValue = parseFloat(displayValue.value);
        if (operator && !waitingForSecondOperand) {
        const result = calculate(firstOperand, inputValue, operator);
        displayValue.value = `${parseFloat(result.toFixed(7))}`;
        firstOperand = result;
        operator = null;
        }
    }
    
    /** C (clear) */
    function onClear() {
        displayValue.value = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
    }
    </script>
    
    <style scoped>
    /* 모달 배경 */
    .calc-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.4); /* 어두운 반투명 배경 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    /* 모달 박스 */
    .calc-modal-content {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        min-width: 300px;
        text-align: center;
        position: relative;
    }
    
    /* 닫기 버튼 */
    .close-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        border: none;
        background: transparent;
        font-size: 1rem;
        cursor: pointer;
    }
    
    /* 디스플레이 영역 */
    .display {
        border: 1px solid #ccc;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        text-align: right;
        min-height: 2rem;
        font-size: 1.2rem;
        border-radius: 4px;
        background: #f2f2f2;
    }
    
    /* 키패드 버튼 */
    .keypad button {
        width: 50px;
        height: 40px;
        margin: 2px;
        font-size: 1rem;
        cursor: pointer;
    }
    </style>
    