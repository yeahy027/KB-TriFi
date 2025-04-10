    <template>
        <!-- v-if="visible"일 때 모달 + 어두운 배경 표시 -->
        <transition name="fade">
        <div v-if="visible" class="delete-overlay">
            <div class="delete-popup">
            <h3>정말 삭제하시겠습니까?</h3>
            <p style="margin: 8px 0; font-size: 0.9rem; color: #666;">
                이 작업은 되돌릴 수 없습니다.
            </p>
            <div class="buttons">
                <button class="confirm-btn" @click="$emit('confirm')">삭제</button>
                <button class="cancel-btn" @click="$emit('close')">취소</button>
            </div>
            </div>
        </div>
        </transition>
    </template>
    
    <script setup>
    /**
     * 부모 컴포넌트에서
     *  - visible (Boolean) : 모달 열림 여부
     *  - @confirm : 최종 삭제 확정 클릭
     *  - @close   : 모달 닫기
     */
    const props = defineProps({
        visible: {
        type: Boolean,
        default: false
        }
    });
    </script>
    
    <style scoped>
    /* 페이드 트랜지션 */
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
    
    /* 전체 오버레이 배경 */
    .delete-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /* 반투명 배경 */
        background-color: rgba(0, 0, 0, 0.5);
    
        /* 화면 중앙 정렬 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999; /* 가장 위에 표시 */
    }
    
    /* 실제 팝업 박스 */
    .delete-popup {
        background: #fff;
        padding: 24px 32px;
        border-radius: 8px;
        width: 320px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    /* 버튼들 정렬 */
    .buttons {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    /* 삭제 버튼 */
    .confirm-btn {
        background-color: #dc3545; /* bootstrap의 btn-danger 색상 */
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    .confirm-btn:hover {
        background-color: #c82333;
    }
    
    /* 취소 버튼 */
    .cancel-btn {
        background-color: #6c757d; /* bootstrap의 btn-secondary 색상 */
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    .cancel-btn:hover {
        background-color: #5a6268;
    }
    </style>
    